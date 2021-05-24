/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const fs = require('fs');
const path = require('path');

module.exports = class FileUtil {
  static filename(filepath) {
    return path.parse(filepath).name;
  }

  static reloadFile(filepath, reloadFunction = () => null) {
    const dir = path.resolve(filepath);
    delete require.cache[dir];
    return reloadFunction(require(dir), dir);
  }

  static async readDirectory(directory, loadFunction = () => null) {
    return Promise.all(
      FileUtil.readdirRecursive(directory).map((filepath) => loadFunction(require(path.resolve(filepath)), filepath)),
    );
  }

  static readdirRecursive(directory) {
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
};
