import { readdirSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

const reloadFile = async <A>(
  filepath: string,
  reloadFunction: (file: A, dir: string) => Promise<void>,
): Promise<void> => {
  const dir = resolve(filepath);
  delete require.cache[dir];
  await reloadFunction((await import(dir)).default, dir);
};

const readDirectory = <T>(
  path: string,
  loadFunction: (archive: T, archivePath: string) => void,
): void => {
  readdirRecursive(path).map(async (filepath) => {
    loadFunction((await import(resolve(filepath))).default, filepath);
  });
};

const readdirRecursive = (directory: string): string[] => {
  return readdirSync(directory).reduce<string[]>((p, file) => {
    const filepath = join(directory, file);

    if (statSync(filepath).isDirectory()) return [...p, ...readdirRecursive(filepath)];

    if (extname(filepath) !== 'ts') return p;

    return [...p, filepath];
  }, []);
};

export { readDirectory, readdirRecursive, reloadFile };
