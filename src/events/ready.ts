import MenheraClient from 'MenheraClient';
import HttpRequests from '@utils/HTTPrequests';
import { IStatusData } from '@utils/Types';
import HttpServer from '@structures/server/server';
import DBLWebhook from '@structures/server/controllers/DBLWebhook';
import { getMillisecondsToTheEndOfDay } from '@utils/Util';
import { Client } from 'discord.js-light';
// import PostInteractions from '@structures/server/controllers/PostInteractions';

let inactiveTimeout: NodeJS.Timeout;
let dailyLoopTimeout: NodeJS.Timeout;

export default class ReadyEvent {
  async run(client: MenheraClient): Promise<void> {
    if (!client.user) return;
    if (!client.shard) return;
    if (process.env.NODE_ENV === 'development') return;

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

      ReadyEvent.dailyLoop(client);
      ReadyEvent.verifyInactive(client);

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

    const getShardsInfo = (c: Client<true>) => {
      const memoryUsed = process.memoryUsage().heapUsed;
      const { uptime } = c;
      const guilds = c.guilds.cache.size;
      const unavailable = c.guilds.cache.reduce((p, b) => (b.available ? p : p + 1), 0);
      const { ping } = c.ws;
      const members = c.guilds.cache.reduce((p, b) => (b.available ? p + b.memberCount : p), 0);
      const id = c.shard?.ids[0] ?? 0;

      return { memoryUsed, uptime, guilds, unavailable, ping, members, id };
    };

    const results = await client.shard?.broadcastEval(getShardsInfo);
    if (!results) return;

    const toSendData: IStatusData[] = Array(client.shard?.count)
      .fill('a')
      .map((_, i) => ({
        ...results[i],
        lastPingAt: Date.now(),
      }));

    await HttpRequests.postShardStatus(toSendData);
  }

  static async dailyLoop(client: MenheraClient): Promise<void> {
    const toLoop = async (c: MenheraClient) => {
      const allBannedUsers = await c.repositories.userRepository.getAllBannedUsersId();
      await c.repositories.blacklistRepository.addBannedUsers(allBannedUsers);
    };

    toLoop(client);
    clearTimeout(dailyLoopTimeout);
    dailyLoopTimeout = setTimeout(async () => {
      toLoop(client);
    }, getMillisecondsToTheEndOfDay());
  }

  static async verifyInactive(client: MenheraClient): Promise<void> {
    clearTimeout(inactiveTimeout);
    inactiveTimeout = setTimeout(async () => {
      const inactiveUsers = await client.database.Users.find(
        {
          $and: [
            {
              $or: [
                { lastCommandAt: { $lte: Date.now() - 1_209_600_000 } },
                { lastCommandAt: { $exists: false } },
              ],
            },
            {
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
        const weeks =
          !a.lastCommandAt || a.lastCommandAt === 0
            ? 10
            : parseFloat(((Date.now() - a.lastCommandAt) / 1_209_600_000).toFixed(1));

        let estrelinhas =
          Math.floor(a.estrelinhas / 250_000) >= 4
            ? Math.floor((a.estrelinhas / 4) * weeks)
            : Math.floor((a.estrelinhas / 8) * weeks);
        let demons =
          Math.floor(a.demons / 60) >= 4
            ? Math.floor((a.demons / 4) * weeks)
            : Math.floor((a.demons / 8) * weeks);
        let giants =
          Math.floor(a.giants / 50) >= 4
            ? Math.floor((a.giants / 4) * weeks)
            : Math.floor((a.giants / 8) * weeks);
        let angels =
          Math.floor(a.angels / 40) >= 4
            ? Math.floor((a.angels / 4) * weeks)
            : Math.floor((a.angels / 8) * weeks);
        let archangels =
          Math.floor(a.archangels / 10) >= 4
            ? Math.floor((a.archangels / 4) * weeks)
            : Math.floor((a.archangels / 8) * weeks);
        let demigods =
          Math.floor(a.demigods / 5) >= 4
            ? Math.floor((a.demigods / 4) * weeks)
            : Math.floor((a.demigods / 8) * weeks);
        let gods =
          Math.floor(a.gods / 2) >= 4
            ? Math.floor((a.gods / 4) * weeks)
            : Math.floor((a.gods / 8) * weeks);

        if (a.estrelinhas < estrelinhas) estrelinhas = a.estrelinhas;
        if (a.demons < demons) demons = a.demons;
        if (a.giants < giants) giants = a.giants;
        if (a.angels < angels) angels = a.angels;
        if (a.archangels < archangels) archangels = a.archangels;
        if (a.demigods < demigods) demigods = a.demigods;
        if (a.gods < gods) gods = a.gods;

        estrelinhas *= -1;
        demons *= -1;
        giants *= -1;
        angels *= -1;
        archangels *= -1;
        demigods *= -1;
        gods *= -1;

        return { $inc: { estrelinhas, demons, giants, angels, archangels, demigods, gods } };
      });

      if (inactiveUsers.length > 0) {
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

        console.log(result);
      }
      ReadyEvent.verifyInactive(client);
    }, getMillisecondsToTheEndOfDay());
  }
}
