const resolveCustomId = (customId: string): string =>
  customId
    .replace(/^[\s\d]+/, '')
    .replace(`|`, '')
    .trim();

const cons = (): void => {
  console.log('cexo');
};

export { resolveCustomId, cons };
