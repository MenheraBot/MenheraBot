/* eslint-disable no-unused-vars */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
import fs from 'fs';
import path from 'path';

export default class FileUtil {
  static filename(filepath: string) {
    return path.parse(filepath).name;
  }

  static reloadFile(
    filepath: string,
    reloadFunction: (file: unknown, dir: string) => unknown,
  ): unknown {
    const dir = path.resolve(filepath);
    delete require.cache[dir];
    return reloadFunction(require(dir), dir);
  }

  static async readDirectory(directory: string, loadFunction: Function) {
    return Promise.all(
      FileUtil.readdirRecursive(directory).map((filepath: string) =>
        loadFunction(require(path.resolve(filepath)), filepath),
      ),
    );
  }

  static readdirRecursive(directory: string) {
    return fs.readdirSync(directory).reduce((p, file) => {
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
