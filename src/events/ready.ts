import MenheraClient from 'MenheraClient';
import { getMillisecondsToTheEndOfDay } from '@utils/Util';
import { postBotStatus, postShardStatus } from '@structures/StatusPoster';
import HttpServer from '@structures/server/server';
import DBLWebhook from '@structures/server/controllers/DBLWebhook';
import InactivityPunishment from '@structures/InactivityPunishment';
import PostInteractions from '@structures/server/controllers/PostInteractions';

let dailyLoopTimeout: NodeJS.Timeout;

export default class ReadyEvent {
  async run(client: MenheraClient): Promise<void> {
    if (!client.user) return;
    if (client.cluster.id === 0) {
      HttpServer.getInstance().registerRouter('DBL', DBLWebhook(client));
      HttpServer.getInstance().registerRouter('INTERACTIONS', PostInteractions(client));
    }

    if (process.env.NODE_ENV === 'development') {
      // DeployDeveloperCommants(client);
      return;
    }

    const isMasterShard = (id: number) => id === client.cluster.count - 1;

    /*  const updateActivity = async (cluster: number) =>
      client.user?.setActivity(await HttpRequests.getActivity(cluster)); 
      setInterval(() => updateActivity(clusterId), 1000 * 60 * 10);
    */

    const clusterId = client.cluster.id;

    //  setInterval(() => updateActivity(clusterId), 1000 * 60 * 10);

    if (isMasterShard(clusterId)) {
      ReadyEvent.dailyLoop(client);

      InactivityPunishment(client);
      postShardStatus(client);
      postBotStatus(client);

      // @ts-expect-error Reload command doesnt exist in client<boolean>
      await client.cluster.broadcastEval((c: MenheraClient) => {
        c.shardProcessEnded = true;
      });
    }

    console.log(`[READY] Menhera Client ${client.cluster.id} its ready to receive events!`);
  }

  static async dailyLoop(client: MenheraClient): Promise<void> {
    const toLoop = async (c: MenheraClient) => {
      const allBannedUsers = await c.repositories.blacklistRepository.getAllBannedUsersId();
      await c.repositories.blacklistRepository.addBannedUsers(allBannedUsers);
    };

    toLoop(client);
    clearTimeout(dailyLoopTimeout);
    dailyLoopTimeout = setTimeout(async () => {
      toLoop(client);
    }, getMillisecondsToTheEndOfDay());
  }
}
