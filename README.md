### build-statistics-plugin

在 `webpack.config.js` 中使用插件，  
```
const BuildStatisticsPlugin = require('./dist/index.js');
...
module.exports = {
    ...,
    plugins: [
        ...,
        new BuildStatisticsPlugin({

            // 获取webpack加载的所有文件的耗时信息
            // 由于webpack使用了缓存机制，已加载过的文件只记录一次
            buildDependency: {
                done: json => ...,
            },

            // 获取每个入口文件，webpack处理过程中各阶段的总耗时时间
            compilationStep: {
                done: json => ...,
            },

            // 获取webpack载入的所有文件的依赖关系
            // 被缓存过的文件如果被多个文件依赖，也会展示多次
            resolveDependency: {
                done: json => ...,
            },
        }),
    ],
};
```
