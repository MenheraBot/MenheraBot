import MenheraClient from 'MenheraClient';
import HttpRequests from '@utils/HTTPrequests';
import { IStatusData } from '@utils/Types';
import HttpServer from '@structures/server/server';
import DBLWebhook from '@structures/server/controllers/DBLWebhook';
import { getMillisecondsToTheEndOfDay } from '@utils/Util';
// import PostInteractions from '@structures/server/controllers/PostInteractions';

let inactiveTimeout: NodeJS.Timeout;

export default class ReadyEvent {
  async run(client: MenheraClient): Promise<void> {
    if (!client.user) return;
    if (!client.shard) return;
    if (client.user.id !== process.env.MENHERA_ID) return;

    const isMasterShard = (id: number) => id === (client.shard?.count as number) - 1;

    const updateActivity = async (shard: number) =>
      client.user?.setActivity(await HttpRequests.getActivity(shard));

    const shardId = client.shard.ids[0];

    setInterval(() => {
      updateActivity(shardId);
    }, 1000 * 60);

    if (isMasterShard(shardId)) {
      HttpServer.getInstance().registerRouter('DBL', DBLWebhook(client));
      // HttpServer.getInstance().registerRouter('INTERACTIONS', PostInteractions(this.client));

      ReadyEvent.verifyInactive(client);

      const allBannedUsers = await client.repositories.userRepository.getAllBannedUsersId();
      await client.repositories.blacklistRepository.addBannedUsers(allBannedUsers);
      await HttpRequests.resetCommandsUses();

      setInterval(() => {
        ReadyEvent.postShardStatus(client);
      }, 15 * 1000);

      setInterval(async () => {
        if (!client.shard) return;
        if (!client.user) return;
        const info = (await client.shard.fetchClientValues('guilds.cache.size')) as number[];
        await HttpRequests.postBotStatus(client.user.id, info);
      }, 1800000);
    }

    console.log('[READY] Menhera se conectou com o Discord!');
  }

  static async postShardStatus(client: MenheraClient): Promise<void> {
    const ShardingEnded = await client.isShardingProcessEnded();
    if (!ShardingEnded) return;

    const results = (await Promise.all([
      client.shard?.broadcastEval(() => process.memoryUsage().heapUsed),
      client.shard?.broadcastEval((c) => c.uptime),
      client.shard?.fetchClientValues('guilds.cache.size'),
      client.shard?.broadcastEval((c) =>
        c.guilds.cache.reduce((p, b) => (b.available ? p : p + 1), 0),
      ),
      client.shard?.broadcastEval((c) => c.ws.ping),

      client.shard?.broadcastEval((c) =>
        c.guilds.cache.reduce((p, b) => (b.available ? p + b.memberCount : p), 0),
      ),
      client.shard?.broadcastEval((c) => c.shard?.ids[0]),
    ])) as number[][];

    const toSendData: IStatusData[] = Array(client.shard?.count)
      .fill('a')
      .map((_, i) => ({
        memoryUsed: results[0][i],
        uptime: results[1][i],
        guilds: results[2][i],
        unavailable: results[3][i],
        ping: results[4][i],
        members: results[5][i],
        id: results[6][i],
        lastPingAt: Date.now(),
      }));

    await HttpRequests.postShardStatus(toSendData);
  }

  static async verifyInactive(client: MenheraClient): Promise<void> {
    clearTimeout(inactiveTimeout);
    inactiveTimeout = setTimeout(async () => {
      /*   const inactiveUsers = await client.database.Users.find(
        {
          lastCommandAt: { $lte: Date.now() - 604800000 },
          $or: [
            { estrelinhas: { $gte: 250000 } },
            { demons: { $gte: 60 } },
            { giants: { $gte: 50 } },
            { angels: { $gte: 40 } },
            { archangels: { $gte: 30 } },
            { demigods: { $gte: 20 } },
            { gods: { $gte: 5 } },
          ],
        },
        [
          'estrelinhas',
          'id',
          'lastCommandAt',
          'demons',
          'giants',
          'angels',
          'archangels',
          'demigods',
          'gods',
        ],
      );

        const ids = inactiveUsers.map((a) => a.id);

      const updatedData = inactiveUsers.map((a) => {

      }); */
    }, getMillisecondsToTheEndOfDay());
  }
}
