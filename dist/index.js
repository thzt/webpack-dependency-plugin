"use strict";

require("@babel/polyfill"); // 将多个webpack plugin合并成一个插件


var combinePlugin = require('./util/combine-plugin'); // 用于统计每个模块load进内存所需要的时间


var BuildDependencyPlugin = require('./plugin/build-dependency-plugin'); // 用于统计每个入口文件，编译各步骤所需要的时间


var CompilationStepPlugin = require('./plugin/compilation-step-plugin'); // 由于webpack加载文件时有缓存，文件只会被加载一次，所以build-dependency-plugin就不利于分析文件之间的依赖关系
// 以下插件分析了webpack加载的所有文件之间的依赖关系


var ResolveDependencyPlugin = require('./plugin/resolve-dependency-plugin'); // 将多个独立的webpack插件合并成一个


module.exports = combinePlugin({
  buildDependency: BuildDependencyPlugin,
  compilationStep: CompilationStepPlugin,
  resolveDependency: ResolveDependencyPlugin
});