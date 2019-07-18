"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var fs = require('fs');

var Graph = require('../util/graph');

var _process$argv = _slicedToArray(process.argv, 4),
    node = _process$argv[0],
    currentFile = _process$argv[1],
    adjacentListFile = _process$argv[2],
    refedFilePath = _process$argv[3];

var content = fs.readFileSync(adjacentListFile);
var adjacentList = JSON.parse(content);
var graph = new Graph(adjacentList); // 获取所有路径依赖了给定文件的文件

var vertexes = graph.getRefs([refedFilePath], false);
console.log('ref files path: ', JSON.stringify(vertexes, null, 4));