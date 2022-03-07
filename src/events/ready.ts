import MenheraClient from 'MenheraClient';
import HttpRequests from '@utils/HTTPrequests';
import HttpServer from '@structures/server/server';
import DBLWebhook from '@structures/server/controllers/DBLWebhook';
import { getMillisecondsToTheEndOfDay } from '@utils/Util';
import InactivityPunishment from '@structures/InactivityPunishment';
import { postBotStatus, postShardStatus } from '@structures/StatusPoster';
import DeployDeveloperCommants from '@structures/DeployDeveloperCommants';
// import PostInteractions from '@structures/server/controllers/PostInteractions';

let dailyLoopTimeout: NodeJS.Timeout;

export default class ReadyEvent {
  async run(client: MenheraClient): Promise<void> {
    if (!client.user) return;
    if (process.env.NODE_ENV === 'development') return;

    const isMasterShard = (id: number) => id === (client.cluster.count as number) - 1;

    const updateActivity = async (shard: number) =>
      client.user?.setActivity(await HttpRequests.getActivity(shard));

    const clusterId = client.cluster.id;

    setInterval(() => updateActivity(clusterId), 1000 * 60 * 10);

    if (isMasterShard(clusterId)) {
      HttpServer.getInstance().registerRouter('DBL', DBLWebhook(client));
      // HttpServer.getInstance().registerRouter('INTERACTIONS', PostInteractions(this.client));

      ReadyEvent.dailyLoop(client);

      InactivityPunishment(client);
      postShardStatus(client);
      postBotStatus(client);
      DeployDeveloperCommants(client);

      // @ts-expect-error Reload command doesnt exist in client<boolean>
      await client.cluster.broadcastEval((c: MenheraClient) => {
        c.shardProcessEnded = true;
      });
    }

    console.log('[READY] Menhera se conectou com o Discord!');
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
}
