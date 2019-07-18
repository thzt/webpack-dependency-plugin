// 根据不同的模块类型，获取resource文件路径

const { UnrecognizedModuleTypeError } = require('./error');

const getModuleResource = module => {
  const moduleType = module.constructor.name;

  switch (moduleType) {
    case 'NormalModule':
      return module.resource;

    case 'ContextModule':
      return module.issuer.resource;

    case 'MultiModule':
      // note: 对于MultiModule来说，要从_identifier中取值，
      // _identifier是一个以“multi ”开头的字符串
      const multiModuleRegExp = /^multi (.+)$/;
      const multiModuleMatch = multiModuleRegExp.exec(module._identifier);
      return multiModuleMatch[1];

    case 'ExternalModule':
      return module.userRequest;

    case 'RawModule':
      // note: 对于RawModule来说，要从readableIdentifierStr中取值，
      //readableIdentifierStr是一个以“ (ignored)”结尾的字符串
      const rawModuleRegExp = /^(.+) \(ignored\)$/;
      const rawModuleMatch = rawModuleRegExp.exec(module.readableIdentifierStr);
      return rawModuleMatch[1];

    case 'DependenciesBlock':
      return module.resource;

    default:
      throw new UnrecognizedModuleTypeError(moduleType);
  }
};

module.exports = getModuleResource;