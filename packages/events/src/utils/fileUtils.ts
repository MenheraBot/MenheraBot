import { readdirSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

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

    if (extname(filepath) !== '.js') return p;
    return [...p, filepath];
  }, []);
};

export { readDirectory, readdirRecursive };
