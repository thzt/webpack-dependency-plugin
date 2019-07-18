"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
  Graph实例中保存了一个有向图，  
  ```
  {
      a:[
          b,
          c,
          x
      ],
      b:[
          c
      ]
  }
  ```
    
  并且提供了一些常用的图操作方法，  
  （1）给有向图添加边  
  （2）获取所有的顶点  
  （3）转换成JSON  
  （4）获取顶点路径依赖的顶点集合  
  （5）获取顶点被哪些顶点直接依赖、路径依赖  
*/
var union = require('./union'); // 一个与有向图相关的操作类


var Graph =
/*#__PURE__*/
function () {
  function Graph() {
    var adjacencyList = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Graph);

    var graph = this;
    graph.adjacencyList = adjacencyList;
  } // 为给定顶点添加多条边


  _createClass(Graph, [{
    key: "addEdges",
    value: function addEdges(vertex, otherVertexes) {
      var graph = this;
      var adjacencyList = graph.adjacencyList;
      adjacencyList[vertex] = adjacencyList[vertex] == null ? otherVertexes : adjacencyList[vertex].concat(otherVertexes);
      return graph;
    } // 获取所有的顶点

  }, {
    key: "getAllVertexes",
    value: function getAllVertexes() {
      var graph = this;
      var adjacencyList = graph.adjacencyList;
      return Object.keys(adjacencyList);
    } // 获取所有被依赖的顶点

  }, {
    key: "getAllDepVertexes",
    value: function getAllDepVertexes() {
      var graph = this;
      var adjacencyList = graph.adjacencyList;
      var result = Object.keys(adjacencyList).reduce(function (memo, vertex) {
        var depVertexes = adjacencyList[vertex];
        depVertexes.forEach(function (depVertex) {
          memo[depVertex] = true;
        });
        return memo;
      }, {});
      return Object.keys(result);
    } // 转换成json

  }, {
    key: "toJSON",
    value: function toJSON() {
      var graph = this;
      var adjacencyList = graph.adjacencyList; // deep copy
      // 使用stringify和parse复制一份全新的json对象，防止返回引用对象被误修改

      return JSON.parse(JSON.stringify(adjacencyList));
    } // 获取某些顶点所路径依赖顶点的并集，includeSelf表示结果是否包含当前这些顶点

  }, {
    key: "getDeps",
    value: function getDeps(vertexes) {
      var includeSelf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var graph = this;
      var adjacencyList = graph.adjacencyList;

      var search = function search(vertexes, adjacencyList) {
        return union.apply(void 0, _toConsumableArray(vertexes.map(function (vertex) {
          return adjacencyList[vertex] == null ? [] : adjacencyList[vertex];
        })));
      };

      var depVertexes = graph._recursiveSearch(vertexes, search);

      return includeSelf ? union(vertexes, depVertexes) : depVertexes;
    } // 获取某些顶点被哪些节点所路径依赖，includeSelf表示结果是否包含当前这些顶点

  }, {
    key: "getRefs",
    value: function getRefs(vertexes) {
      var includeSelf = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var graph = this;
      var adjacencyList = graph.adjacencyList;

      var search = function search(vertexes, adjacencyList) {
        return graph.getDirectRefs(vertexes);
      };

      var refVertexes = graph._recursiveSearch(vertexes, search);

      return includeSelf ? union(vertexes, refVertexes) : refVertexes;
    } // 获取顶点的一级依赖而不是路径依赖的顶点集合

  }, {
    key: "getDirectRefs",
    value: function getDirectRefs(vertexes) {
      var graph = this;
      var adjacencyList = graph.adjacencyList;
      var directRefs = Object.keys(adjacencyList).filter(function (vertex) {
        return adjacencyList[vertex].some(function (depVertex) {
          return vertexes.some(function (vertex) {
            return depVertex === vertex;
          });
        });
      });
      return directRefs;
    } // 合并两个graph，noDuplicateKey表示遇到重名顶点时是否报错

  }, {
    key: "merge",
    value: function merge(anotherGraph) {
      var noDuplicateKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var graph = this;
      var json1 = graph.toJSON();
      var json2 = anotherGraph.toJSON();
      Object.keys(json2).forEach(function (key) {
        var value = json2[key];

        if (json1[key] != null && noDuplicateKey) {
          throw new Error(`duplicate key: ${key}`);
        }

        json1[key] = value;
      });
      return new Graph(json1);
    } // private method 
    // 一个递归函数，用来递归搜索路径依赖关系，直到最后一级的依赖为空

  }, {
    key: "_recursiveSearch",
    value: function _recursiveSearch(vertexes, search) {
      var graph = this;
      var adjacencyList = graph.adjacencyList;
      var resultVertexes = search(vertexes, adjacencyList);

      if (resultVertexes.length === 0) {
        return resultVertexes;
      }

      return union(resultVertexes, graph._recursiveSearch(resultVertexes, search));
    }
  }]);

  return Graph;
}();

module.exports = Graph;