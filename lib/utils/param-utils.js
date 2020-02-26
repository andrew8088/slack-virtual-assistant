function getNum(text, defaultValue = 48) {
  const matchData = text.match(/.*?(\d+).*?/);

  if (!matchData || !matchData[1]) return defaultValue;

  const num = parseInt(matchData[1], 10);
  if (isNaN(num)) return defaultValue;

  return num;
}

module.exports = {
  getNum
};
