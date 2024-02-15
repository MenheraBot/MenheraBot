import { DiscordInteraction } from 'discordeno/types';

const respondInteraction = (data: DiscordInteraction): string | void => {
  if ([2, 3, 5].includes(data.type))
    return '{"type":4,"data":{"flags": 64,"content":"# Manutenção programada \\n\\nA Menhera está descansando enquanto faço uma migração do servidor dela. Os comandos estão desligados para não haver nenhuma divergência de dados quando ela voltar.\\n\\nPara acompanhar em tempo real, acesse a Status Page em https://menherabot.xys/status","allowed_mentions":{"parse":[]}}}';
};

export { respondInteraction };
