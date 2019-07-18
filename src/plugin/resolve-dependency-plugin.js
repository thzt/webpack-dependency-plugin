/* 
  由于webpack加载文件时有缓存，所以某些文件是不经历build阶段的，
  build-dependency-plugin中可能不包含某些文件。

  本插件的目的是获取所有文件的依赖关系，即使某些插件因为缓存原因没有build。
*/

const Graph = require('../util/graph');
const getModuleResource = require('../util/get-module-resource');
const exceptionWrapper = require('../util/exception-wrapper');

class ResolveDependencyPlugin {
  constructor({ done, error }) {
    this._done = done;
    this._error = error;
    this._graph = new Graph;
  }

  apply(compiler) {
    compiler.plugin('after-compile', exceptionWrapper.cps((compilation, callback) => {

      // compilation: {
      //   entries: [
      //     {
      //       resource,
      //       dependencies: [
      //         {
      //           module: {
      //             resource,
      //             dependencies: [],
      //           },
      //         }
      //       ],
      //     }
      //   ],
      // }
      const { entries } = compilation;

      // note: entries和dependencies不等价
      // entries的元素值就是module，而dependencies的元素值的module属性才是module。
      entries.forEach(({ resource, dependencies }) => this._recursive(resource, dependencies));

      callback(null, compilation);
    }, this._error));

    compiler.plugin('done', () => this._done(this._graph.toJSON()));
  }

  _recursive(resource, dependencies) {
    dependencies.forEach(({ module: childModule }) => {
      if (childModule == null) {
        return;
      }

      const childResource = getModuleResource(childModule);
      this._graph.addEdges(resource, [childResource]);

      // 处理对于有循环依赖的情形
      // 如果顶点已经在有向图中存在了，就不继续处理了。
      const isCyclic = this._graph.getAllVertexes().some(vertex => vertex === childResource);
      if (isCyclic) {
        return;
      }

      this._recursive(childResource, childModule.dependencies);
    });
  }
}

module.exports = ResolveDependencyPlugin;
