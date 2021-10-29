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

      // ReadyEvent.verifyInactive(client); ONLY START IN DEZEMBER

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
      const inactiveUsers = await client.database.Users.find(
        {
          lastCommandAt: { $lte: Date.now() - 1_209_600_000 },
          $or: [
            { estrelinhas: { $gte: 250_000 } },
            { demons: { $gte: 60 } },
            { giants: { $gte: 50 } },
            { angels: { $gte: 40 } },
            { archangels: { $gte: 30 } },
            { demigods: { $gte: 20 } },
            { gods: { $gte: 7 } },
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
        const weeks = parseFloat((Date.now() - a.lastCommandAt / 1_209_600_000).toFixed(1));

        let estrelinhas =
          (Math.floor(a.estrelinhas / 250_000) >= 4
            ? Math.floor((a.estrelinhas / 4) * weeks)
            : Math.floor(a.estrelinhas / 8) * weeks) * -1;
        let demons =
          (Math.floor(a.demons / 60) >= 4
            ? Math.floor((a.demons / 4) * weeks)
            : Math.floor(a.demons / 8) * weeks) * -1;
        let giants =
          (Math.floor(a.giants / 50) >= 4
            ? Math.floor((a.giants / 4) * weeks)
            : Math.floor(a.giants / 8) * weeks) * -1;
        let angels =
          (Math.floor(a.angels / 40) >= 4
            ? Math.floor((a.angels / 4) * weeks)
            : Math.floor(a.angels / 8) * weeks) * -1;
        let archangels =
          (Math.floor(a.archangels / 10) >= 4
            ? Math.floor((a.archangels / 4) * weeks)
            : Math.floor(a.archangels / 8) * weeks) * -1;
        let demigods =
          (Math.floor(a.demigods / 5) >= 4
            ? Math.floor((a.demigods / 4) * weeks)
            : Math.floor(a.demigods / 8) * weeks) * -1;
        let gods =
          (Math.floor(a.gods / 2) >= 4
            ? Math.floor((a.gods / 4) * weeks)
            : Math.floor(a.gods / 8) * weeks) * -1;

        if (a.estrelinhas - estrelinhas < 0) estrelinhas = 0;
        if (a.demons - demons < 0) demons = 0;
        if (a.giants - giants < 0) giants = 0;
        if (a.angels - angels < 0) angels = 0;
        if (a.archangels - archangels < 0) archangels = 0;
        if (a.demigods - demigods < 0) demigods = 0;
        if (a.gods - gods < 0) gods = 0;

        return { $inc: { estrelinhas, demons, giants, angels, archangels, demigods, gods } };
      });
      const bulkUpdate = client.database.Users.collection.initializeUnorderedBulkOp();

      ids.forEach((id, index) => {
        bulkUpdate.find({ id }).updateOne(updatedData[index]);
      });

      const startTime = Date.now();
      const result = await bulkUpdate.execute();
      if (result)
        console.log(
          `[DATABASE BULK] - Inactive users executed in ${Date.now() - startTime}ms: `,
          result,
        );
      else console.log('[DATABASE BULK] - Error when bulking');

      this.verifyInactive(client);
    }, getMillisecondsToTheEndOfDay());
  }
}
