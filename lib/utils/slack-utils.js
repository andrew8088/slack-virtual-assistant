function splitHandles(text) {
  return text
    .toLowerCase()
    .split("@")
    .map(part => part.trim())
    .filter(x => x);
}

module.exports = {
  splitHandles
};
