/*
  将多个webpack plugin合并成一个插件

  （1）假设每个单独Plugin1，Plugin2的用法如下
  new Plugin1({
    a,
    b,
  });

  new Plugin2({
    x,
    y,
  });

  （2）则可以使用combinePlugin进行合并
  const Plugin = combinePlugin({
    name1: Plugin1,
    name2: Plugin2,
  });

  （3）合并后的Plugin用法如下（未实例化Plugin2）
  new Plugin({
    name1: {
      a,
      b,
    },
  });
*/
const combinePlugin = configs => class {
  constructor(args) {
    this._plugins = Object.keys(configs).reduce((memo, key) => {
      const arg = args[key];

      // 合并后的插件，如果没传入某内部插件需要的参数，就不实例化它
      if (arg == null) {
        return memo;
      }

      const Plugin = configs[key];
      memo.push(new Plugin(arg));
      return memo;
    }, []);
  }

  apply(...args) {
    this._plugins.forEach(plugin => plugin.apply(...args));
  }
};

module.exports = combinePlugin;