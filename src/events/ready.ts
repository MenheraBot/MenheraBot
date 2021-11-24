import MenheraClient from 'MenheraClient';
import HttpRequests from '@utils/HTTPrequests';
import HttpServer from '@structures/server/server';
import DBLWebhook from '@structures/server/controllers/DBLWebhook';
import { getMillisecondsToTheEndOfDay } from '@utils/Util';
import InactivityPunishment from '@structures/InactivityPunishment';
import { postShardStatus } from '@structures/StatusPoster';
import DeployDeveloperCommants from '@structures/DeployDeveloperCommants';
// import PostInteractions from '@structures/server/controllers/PostInteractions';

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

    setInterval(() => updateActivity(shardId), 1000 * 60 * 5);

    if (isMasterShard(shardId)) {
      HttpServer.getInstance().registerRouter('DBL', DBLWebhook(client));
      // HttpServer.getInstance().registerRouter('INTERACTIONS', PostInteractions(this.client));

      ReadyEvent.dailyLoop(client);

      InactivityPunishment(client);
      postShardStatus(client);
      // postBotStatus(client);
      DeployDeveloperCommants(client);
    }

    console.log('[READY] Menhera se conectou com o Discord!');
  }

  static async dailyLoop(client: MenheraClient): Promise<void> {
    const toLoop = async (c: MenheraClient) => {
      const allBannedUsers = await c.repositories.userRepository.getAllBannedUsersId();
      await c.repositories.blacklistRepository.addBannedUsers(allBannedUsers);
      await HttpRequests.resetCommandsUses();
    };

    toLoop(client);
    clearTimeout(dailyLoopTimeout);
    dailyLoopTimeout = setTimeout(async () => {
      toLoop(client);
    }, getMillisecondsToTheEndOfDay());
  }
}
