"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/*
  Dependency实例中保存了一些父子依赖关系，  
    
  假设有以下两个依赖关系，  
  ```
  parentKey -> childKey2,childValue1
  parentKey -> childKey2,childValue2
  ```
    
  Dependency，会采用两级Map进行存储，  
  ```
  [ (parentKey -> [ (childKey1 -> childValue1), (childKey2 -> childValue2), ... ], ... ]
  ```
  
  例子
  ```
  const dep = new Dependency;

  dep.add({parent:{key:'a'},child:{key:'b',value:'x1'}});
  dep.add({parent:{key:'a'},child:{key:'c',value:'x2'}});
  dep.add({parent:{key:'b'},child:{key:'d',value:'x3'}});

  const json = dep.toJSON();
  // {
  //   "a": {
  //       "b": "x1",
  //       "c": "x2"
  //   },
  //   "b": {
  //       "d": "x3"
  //   }
  // }

  const iter = dep.walk({
      parent: {
          key: 'a',
      },
  });

  while(true){
      const {done,value} = iter.next();
      if(done){
          break;
      }

      console.log(JSON.stringify(value));
  }
  // {"parent":{"key":"a"},"child":{"key":"b","value":"x1"},"isLeaf":false}
  // {"parent":{"key":"b"},"child":{"key":"d","value":"x3"},"isLeaf":true}
  // {"parent":{"key":"a"},"child":{"key":"c","value":"x2"},"isLeaf":true}
  ```
*/
var _require = require('./error'),
    RelationExistError = _require.RelationExistError,
    ParentCannotFoundError = _require.ParentCannotFoundError,
    RelationCannotFoundError = _require.RelationCannotFoundError;

var Dependency =
/*#__PURE__*/
function () {
  function Dependency() {
    _classCallCheck(this, Dependency);

    this._cache = new Map();
  }

  _createClass(Dependency, [{
    key: "_hasParent",
    value: function _hasParent(parentKey) {
      return this._cache.has(parentKey);
    }
  }, {
    key: "_hasDependency",
    value: function _hasDependency(parentKey, childKey) {
      return this._cache.has(parentKey) && this._cache.get(parentKey).has(childKey);
    } // 添加一个新的父子依赖关系
    // 如果已存在相同的依赖关系，则抛异常 RelationExistError

  }, {
    key: "add",
    value: function add(_ref) {
      var parentKey = _ref.parent.key,
          _ref$child = _ref.child,
          childKey = _ref$child.key,
          childValue = _ref$child.value;

      // 如果还没有父级相关的依赖，就添加一个父级节点
      if (!this._hasParent(parentKey)) {
        this._cache.set(parentKey, new Map([[childKey, childValue]]));

        return;
      } // 如果已存在相同的父子级依赖，则报错


      if (this._hasDependency(parentKey, childKey)) {
        throw new RelationExistError(parentKey, childKey);
      } // 为已存在的父级添加一个子依赖


      this._cache.get(parentKey).set(childKey, childValue);
    } // 获取某个依赖关系中，保存在child中的值

  }, {
    key: "getChildValue",
    value: function getChildValue(_ref2) {
      var parentKey = _ref2.parent.key,
          childKey = _ref2.child.key;

      if (!this._hasParent(parentKey)) {
        throw new ParentCannotFoundError(childKey);
      }

      var childKeyValueMap = this._cache.get(parentKey);

      if (!childKeyValueMap.has(childKey)) {
        throw new RelationCannotFoundError(parentKey, childKey);
      }

      return childKeyValueMap.get(childKey);
    } // 转换成json，便于存储到文件中

  }, {
    key: "toJSON",
    value: function toJSON() {
      var _this = this;

      return Array.from(this._cache.keys()).reduce(function (memo, parentKey) {
        var childKeyValueMap = _this._cache.get(parentKey);

        memo[parentKey] = Array.from(childKeyValueMap.keys()).reduce(function (childMemo, childKey) {
          childMemo[childKey] = childKeyValueMap.get(childKey);
          return childMemo;
        }, {});
        return memo;
      }, {});
    }
    /* 
      广度优先遍历
       ```
      const iter = dependency.walk();
      const {done, value} = iter.next();
      ```
        
      其中，`value`的结构如下，  
      ```
      {
          parent: {
              key,
          },
          child: {
              key,
              value,
          },
          isLeaf,
      }
      ```
        
      包含了当前遍历到的父子依赖关系信息，以及是否叶子节点。  
    */

  }, {
    key: "walk",
    value:
    /*#__PURE__*/
    regeneratorRuntime.mark(function walk(_ref3) {
      var parentKey, childKeyValueMap, childKeysIterator, _childKeysIterator$ne, done, childKey, childValue, isLeaf;

      return regeneratorRuntime.wrap(function walk$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              parentKey = _ref3.parent.key;

              if (this._hasParent(parentKey)) {
                _context.next = 3;
                break;
              }

              throw new ParentCannotFoundError();

            case 3:
              childKeyValueMap = this._cache.get(parentKey);
              childKeysIterator = childKeyValueMap.keys();

            case 5:
              if (!true) {
                _context.next = 18;
                break;
              }

              _childKeysIterator$ne = childKeysIterator.next(), done = _childKeysIterator$ne.done, childKey = _childKeysIterator$ne.value;

              if (!done) {
                _context.next = 9;
                break;
              }

              return _context.abrupt("break", 18);

            case 9:
              childValue = childKeyValueMap.get(childKey);
              isLeaf = !this._hasParent(childKey);
              _context.next = 13;
              return {
                parent: {
                  key: parentKey
                },
                child: {
                  key: childKey,
                  value: childValue
                },
                isLeaf
              };

            case 13:
              if (!isLeaf) {
                _context.next = 15;
                break;
              }

              return _context.abrupt("break", 18);

            case 15:
              return _context.delegateYield(this.walk({
                parent: {
                  key: childKey
                }
              }), "t0", 16);

            case 16:
              _context.next = 5;
              break;

            case 18:
            case "end":
              return _context.stop();
          }
        }
      }, walk, this);
    })
  }]);

  return Dependency;
}();
/*
  根据JSON，来生成一个dependency，其中`adjacentList`的结构如下，  
  ```
  {
    "a": {
        "b": "x1",
        "c": "x2"
    },
    "b": {
        "d": "x3"
    }
  }
  ```
*/


Dependency.fromJSON = function (adjacentList) {
  var dependency = new Dependency();
  Object.keys(adjacentList).forEach(function (parentKey) {
    Object.keys(adjacentList[parentKey]).forEach(function (childKey) {
      var childValue = adjacentList[parentKey][childKey];
      dependency.add({
        parent: {
          key: parentKey
        },
        child: {
          key: childKey,
          value: childValue
        }
      });
    });
  });
  return dependency;
};

module.exports = Dependency;