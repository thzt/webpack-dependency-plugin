class RelationExistError extends Error {
  constructor(parentKey, childKey) {
    super(`已存在父子依赖关系\nparent: ${parentKey}\nchild: ${childKey}`);
  }
}

class ParentCannotFoundError extends Error {
  constructor(childKey) {
    if (childKey == null) {
      super(`没有相应的父级节点`);
      return;
    }

    super(`没有相应的父级节点\nchild: ${childKey}`);
  }
}

class RelationCannotFoundError extends Error {
  constructor(parentKey, childKey) {
    super(`没有相应的父子依赖关系\nparent: ${parentKey}\nchild: ${childKey}`);
  }
}

class UnrecognizedModuleTypeError extends Error {
  constructor(name) {
    super(`不能识别的模块类型\ntype: ${name}`);
  }
}

class StepExistError extends Error {
  constructor(stepName) {
    super(`已存在阶段名，${stepName}`);
  }
}

module.exports = {
  // dependency.js 中的报错
  RelationExistError,
  ParentCannotFoundError,
  RelationCannotFoundError,

  // build-dependency-plugin 中的报错
  UnrecognizedModuleTypeError,

  // compilation-step-plugin 中的报错
  StepExistError,
};