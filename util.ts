export function camelCase(str: String) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function(_match, chr) {
    return chr.toUpperCase();
  });
}
