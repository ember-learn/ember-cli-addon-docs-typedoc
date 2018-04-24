module.exports = function generateID(reflection) {
  let source = reflection.sources[0];
  return `${source.fileName}~${reflection.name}`;
}
