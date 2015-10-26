var propTypes = require('prop-types');

var types = exports.types = {};

Object.keys(propTypes).forEach(function(key) {
  if (propTypes[key].isRequired) {
    types[key] = propTypes[key].isRequired;
    types[key].isOptional = propTypes[key];
  } else {
    types[key] = function(arg) {
      var checker = propTypes[key](arg);
      checker.isRequired.isOptional = checker;
      return checker.isRequired;
    };
  }
});

exports.createCustomChecker = function(isValid) {
  return function(props, propName, componentName, location, propFullName) {
    if (!isValid(props[propName])) {
      return new Error(
        'Invalid `' + propName + '` supplied to `' + componentName + '`'
      )
    }
    return null;
  }
}

function keysDiff(o1, o2) {
  var map1 = {};
  var map2 = {};
  for (var key in o1) if (Object.prototype.hasOwnProperty.call(o1, key)) map1[key] = true;
  for (key in o2) if (Object.prototype.hasOwnProperty.call(o2, key)) {
    map1[key] ? delete map1[key] : map2[key] = true;
  }
  var left = Object.keys(map1);
  var right = Object.keys(map2);
  if (left.length === 0 && right.length === 0) return null;
  var errorMessages = [];
  if (left.length) errorMessages.push('missing keys: ' + JSON.stringify(left));
  if (right.length) errorMessages.push('extra keys: ' + JSON.stringify(right));
  return errorMessages.join('\n');
}

types.exactShape = function(shape) {
  var makeChecker = function(isOptional) {
    return function(props, propName, componentName, location, propFullName) {
      if (isOptional && props[propName] == null) {
        return null;
      }
      var diff = keysDiff(shape, props[propName]);
      if (diff) {
        return new Error(diff);
      }
      return types.shape(shape).apply(this, arguments);
    };
  }
  var checker = makeChecker(false);
  checker.isOptional = makeChecker(true);
  return checker;
}

exports.check = function(propTypeValidator) {
  var curriedCheck = function(value) {
    var testObj = { value: value };
    return propTypeValidator(testObj, 'value', 'zan check');
  };
  return arguments.length > 1 ? curriedCheck(arguments[1]) : curriedCheck;
}
