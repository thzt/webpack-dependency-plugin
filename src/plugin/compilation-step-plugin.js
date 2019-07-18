const Cabinet = require('../util/cabinet');
const { StepExistError } = require('../util/error');
const { ENTRY } = require('../util/constant');
const getModuleResource = require('../util/get-module-resource');
const exceptionWrapper = require('../util/exception-wrapper');

class CompilationStepPlugin {
  constructor({ done, error }) {
    this._done = done;
    this._error = error;
    this._cache = new Map;
  }

  apply(compiler) {
    const cabinet = new Cabinet;

    // start compile
    compiler.plugin('compile', exceptionWrapper.sync(() => {
      const stepName = 'start compile';

      if (this._cache.has(stepName)) {
        throw new StepExistError(stepName);
      }

      this._cache.set(stepName, +new Date);
    }, this._error));

    // start compilation
    // note: 以下compilation hooks确保不会抛出异常，因此没有使用wrapException
    compiler.plugin('compilation', compilation => {

      const stepName = 'compilation';

      if (!this._cache.has(stepName)) {
        this._cache.set(stepName, cabinet);
      }

      // start make
      cabinet.put({
        drawer: compilation,
        gadget: {
          name: 'start make',
          time: +new Date,
        },
      });

      // end make
      compilation.plugin('finish-modules', modules => {
        cabinet.put({
          drawer: compilation,
          gadget: {
            name: 'end make',
            time: +new Date,
          }
        });
      });

      // start seal
      compilation.plugin('seal', () => {
        cabinet.put({
          drawer: compilation,
          gadget: {
            name: 'start seal',
            time: +new Date,
          }
        });
      });

      // end chunk-asset
      compilation.plugin('chunk-asset', (chunk, file) => {
        cabinet.put({
          drawer: compilation,
          gadget: {
            name: 'end chunk-asset',
            time: +new Date,
            file,
          }
        });
      });

      // start additional-assets
      compilation.plugin('additional-assets', callback => {
        cabinet.put({
          drawer: compilation,
          gadget: {
            name: 'start additional-assets',
            time: +new Date,
            files: compilation.chunks.reduce((memo, { files }) => memo.concat(files), []),
          }
        });
        callback();
      });

      // end optimize-chunk-assets
      compilation.plugin('after-optimize-chunk-assets', chunks => {
        cabinet.put({
          drawer: compilation,
          gadget: {
            name: 'end optimize-chunk-assets',
            time: +new Date,
          }
        });
      });

      // end seal
      compilation.plugin('after-seal', (callback) => {
        cabinet.put({
          drawer: compilation,
          gadget: {
            name: 'end seal',
            time: +new Date,
          }
        });
        callback();
      });
    });

    // start emit
    compiler.plugin('emit', exceptionWrapper.cps((compilation, callback) => {

      // 捕获同步操作中的异常，用callback第一个参数返回
      try {
        const stepName = 'start emit';

        if (this._cache.has(stepName)) {
          throw new StepExistError(stepName);
        }

        this._cache.set(stepName, +new Date);
        callback();
      } catch (err) {
        callback(err);
      }
    }, this._error));

    // done
    compiler.plugin('done', () => {

      // 为了不捕获this._done中的异常
      // wrap同步操作，返回一个json
      const fn = exceptionWrapper.sync(() => {
        const stepName = 'done';

        if (this._cache.has(stepName)) {
          throw new StepExistError(stepName);
        }

        this._cache.set(stepName, +new Date);

        // 处理_cache中的数据，回调_done函数
        return this._getDumpJSON();
      }, this._error);

      const json = fn();
      this._done(json);
    });
  }

  _getDumpJSON() {
    // note: Map的keys是按加入顺序保存的
    const stepNameList = Array.from(this._cache.keys());

    const json = stepNameList.reduce((memo, stepName) => {
      const value = this._cache.get(stepName);

      if (value instanceof Cabinet) {
        const result = this._cabinetToJSON(value);
        memo.push({
          name: stepName,
          [ENTRY]: result,
        });
        return memo;
      }

      memo.push({
        name: stepName,
        time: value,
      });
      return memo;
    }, []);

    return json;
  }

  _cabinetToJSON(cabinet) {
    const result = {};

    cabinet.getDrawerList().forEach(compilation => {

      // 一次compilation可能有多个entry
      compilation.entries.forEach(module => {
        const moduleResource = getModuleResource(module);
        const gadgetList = cabinet.getGadgetListFromDrawer(compilation);

        let lastTime = gadgetList[0].time;
        result[moduleResource] = gadgetList.map(gadget => {
          gadget.elapse = gadget.time - lastTime;
          lastTime = gadget.time;
          return gadget;
        });
      });
    });

    return result;
  }
}

module.exports = CompilationStepPlugin;
