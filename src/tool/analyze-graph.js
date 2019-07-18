const fs = require('fs');
const Graph = require('../util/graph');

const [node, currentFile, adjacentListFile, refedFilePath] = process.argv;
const content = fs.readFileSync(adjacentListFile);
const adjacentList = JSON.parse(content);
const graph = new Graph(adjacentList);

// 获取所有路径依赖了给定文件的文件
const vertexes = graph.getRefs([refedFilePath], false);
console.log('ref files path: ', JSON.stringify(vertexes, null, 4));
