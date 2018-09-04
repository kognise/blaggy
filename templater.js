function templater(string, names, values) {
  var target = string;
  for (var i = 0; i < names.length; i++) {
    var regexp = new RegExp("{{\\s*" + names[i] + "\\s*}}", "g")
    target = target.replace(regexp, values[i]);
  }
  return target;
}

module.exports = templater;