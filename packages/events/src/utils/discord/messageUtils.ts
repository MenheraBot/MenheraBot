enum MessageFlags {
  EPHEMERAL = 64,
}

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

export { MessageFlags, extractNameAndIdFromEmoji };
