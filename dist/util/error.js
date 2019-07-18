"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (typeof call === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var RelationExistError =
/*#__PURE__*/
function (_Error) {
  _inherits(RelationExistError, _Error);

  function RelationExistError(parentKey, childKey) {
    _classCallCheck(this, RelationExistError);

    return _possibleConstructorReturn(this, _getPrototypeOf(RelationExistError).call(this, `已存在父子依赖关系\nparent: ${parentKey}\nchild: ${childKey}`));
  }

  return RelationExistError;
}(_wrapNativeSuper(Error));

var ParentCannotFoundError =
/*#__PURE__*/
function (_Error2) {
  _inherits(ParentCannotFoundError, _Error2);

  function ParentCannotFoundError(childKey) {
    var _this;

    _classCallCheck(this, ParentCannotFoundError);

    if (childKey == null) {
      _this = _possibleConstructorReturn(this, _getPrototypeOf(ParentCannotFoundError).call(this, `没有相应的父级节点`));
      return _possibleConstructorReturn(_this);
    }

    return _possibleConstructorReturn(this, _getPrototypeOf(ParentCannotFoundError).call(this, `没有相应的父级节点\nchild: ${childKey}`));
  }

  return ParentCannotFoundError;
}(_wrapNativeSuper(Error));

var RelationCannotFoundError =
/*#__PURE__*/
function (_Error3) {
  _inherits(RelationCannotFoundError, _Error3);

  function RelationCannotFoundError(parentKey, childKey) {
    _classCallCheck(this, RelationCannotFoundError);

    return _possibleConstructorReturn(this, _getPrototypeOf(RelationCannotFoundError).call(this, `没有相应的父子依赖关系\nparent: ${parentKey}\nchild: ${childKey}`));
  }

  return RelationCannotFoundError;
}(_wrapNativeSuper(Error));

var UnrecognizedModuleTypeError =
/*#__PURE__*/
function (_Error4) {
  _inherits(UnrecognizedModuleTypeError, _Error4);

  function UnrecognizedModuleTypeError(name) {
    _classCallCheck(this, UnrecognizedModuleTypeError);

    return _possibleConstructorReturn(this, _getPrototypeOf(UnrecognizedModuleTypeError).call(this, `不能识别的模块类型\ntype: ${name}`));
  }

  return UnrecognizedModuleTypeError;
}(_wrapNativeSuper(Error));

var StepExistError =
/*#__PURE__*/
function (_Error5) {
  _inherits(StepExistError, _Error5);

  function StepExistError(stepName) {
    _classCallCheck(this, StepExistError);

    return _possibleConstructorReturn(this, _getPrototypeOf(StepExistError).call(this, `已存在阶段名，${stepName}`));
  }

  return StepExistError;
}(_wrapNativeSuper(Error));

module.exports = {
  // dependency.js 中的报错
  RelationExistError,
  ParentCannotFoundError,
  RelationCannotFoundError,
  // build-dependency-plugin 中的报错
  UnrecognizedModuleTypeError,
  // compilation-step-plugin 中的报错
  StepExistError
};