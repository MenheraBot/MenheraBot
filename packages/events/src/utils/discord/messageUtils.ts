import { MessageFlags } from "@discordeno/bot";

const extractNameAndIdFromEmoji = (
  emoji: string,
  animated = false,
): { name: string; id: bigint; animated: boolean } => {
  const splitted = emoji.split(':');

  if (animated)
    return {
      name: splitted[1],
      id: BigInt(splitted[2].slice(0, -1)),
      animated: true,
    };

  return {
    name: splitted[1],
    animated: false,
    id: BigInt(splitted[2].slice(0, -1)),
  };
};

const removeNonNumbers = (str: string): string => str.replace(/\D/g, '');

const setComponentsV2Flag = (flags: number) => flags & MessageFlags.IsComponentsV2;

export { MessageFlags, extractNameAndIdFromEmoji, removeNonNumbers, setComponentsV2Flag };
