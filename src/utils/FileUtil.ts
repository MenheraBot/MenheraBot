import fs from 'fs';
import path from 'path';

export default class FileUtil {
  static filename(filepath: string): string {
    return path.parse(filepath).name;
  }

  static async reloadFile<A>(
    filepath: string,
    reloadFunction: (file: A, dir: string) => Promise<void>,
  ): Promise<void> {
    const dir = path.resolve(filepath);
    delete require.cache[dir];
    await reloadFunction(await import(dir), dir);
  }

  static readDirectory<T>(
    directory: string,
    loadFunction: (arch: T, pathToArch: string) => void,
  ): void {
    FileUtil.readdirRecursive(directory).map(async (filepath: string) => {
      loadFunction((await import(path.resolve(filepath))).default, filepath);
    });
  }

  static readdirRecursive(directory: string): string[] {
    return fs.readdirSync(directory).reduce<string[]>((p, file) => {
      const filepath = path.join(directory, file);
      const validExtensions = ['.ts', '.js'];

      if (fs.statSync(filepath).isDirectory()) {
        return [...p, ...FileUtil.readdirRecursive(filepath)];
      }

      if (!validExtensions.includes(path.extname(filepath))) {
        return p;
      }

      return [...p, filepath];
    }, []);
  }
}
