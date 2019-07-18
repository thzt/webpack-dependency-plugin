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

const { RelationExistError, ParentCannotFoundError, RelationCannotFoundError } = require('./error');

class Dependency {
  constructor() {
    this._cache = new Map;
  }

  _hasParent(parentKey) {
    return this._cache.has(parentKey);
  }

  _hasDependency(parentKey, childKey) {
    return this._cache.has(parentKey) && this._cache.get(parentKey).has(childKey);
  }

  // 添加一个新的父子依赖关系
  // 如果已存在相同的依赖关系，则抛异常 RelationExistError
  add({ parent: { key: parentKey }, child: { key: childKey, value: childValue } }) {

    // 如果还没有父级相关的依赖，就添加一个父级节点
    if (!this._hasParent(parentKey)) {
      this._cache.set(parentKey, new Map([
        [childKey, childValue],
      ]));
      return;
    }

    // 如果已存在相同的父子级依赖，则报错
    if (this._hasDependency(parentKey, childKey)) {
      throw new RelationExistError(parentKey, childKey);
    }

    // 为已存在的父级添加一个子依赖
    this._cache.get(parentKey).set(childKey, childValue);
  }

  // 获取某个依赖关系中，保存在child中的值
  getChildValue({ parent: { key: parentKey }, child: { key: childKey } }) {
    if (!this._hasParent(parentKey)) {
      throw new ParentCannotFoundError(childKey);
    }

    const childKeyValueMap = this._cache.get(parentKey);
    if (!childKeyValueMap.has(childKey)) {
      throw new RelationCannotFoundError(parentKey, childKey);
    }

    return childKeyValueMap.get(childKey);
  }

  // 转换成json，便于存储到文件中
  toJSON() {
    return Array.from(this._cache.keys()).reduce((memo, parentKey) => {
      const childKeyValueMap = this._cache.get(parentKey);

      memo[parentKey] = Array.from(childKeyValueMap.keys()).reduce((childMemo, childKey) => {
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
  * walk({ parent: { key: parentKey } }) {
    if (!this._hasParent(parentKey)) {
      throw new ParentCannotFoundError;
    }

    const childKeyValueMap = this._cache.get(parentKey);
    const childKeysIterator = childKeyValueMap.keys();

    while (true) {
      const { done, value: childKey } = childKeysIterator.next();
      if (done) {
        break;
      }

      const childValue = childKeyValueMap.get(childKey);
      const isLeaf = !this._hasParent(childKey);

      yield {
        parent: {
          key: parentKey,
        },
        child: {
          key: childKey,
          value: childValue,
        },
        isLeaf,
      };

      // 如果已经到了叶子节点
      if (isLeaf) {
        break;
      }

      // 递归walk
      yield* this.walk({
        parent: {
          key: childKey,
        },
      });
    }
  }
}

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
Dependency.fromJSON = adjacentList => {
  const dependency = new Dependency;

  Object.keys(adjacentList).forEach(parentKey => {
    Object.keys(adjacentList[parentKey]).forEach(childKey => {
      const childValue = adjacentList[parentKey][childKey];

      dependency.add({
        parent: {
          key: parentKey,
        },
        child: {
          key: childKey,
          value: childValue,
        }
      });
    });
  });

  return dependency;
}

module.exports = Dependency;
