// Helper function to get the quarter from a date
const getQuarterFromDate = (date) => {
  const month = date.getMonth() + 1; // months are 0-based, so add 1
  if (month >= 1 && month <= 3) return 1;
  if (month >= 4 && month <= 6) return 2;
  if (month >= 7 && month <= 9) return 3;
  if (month >= 10 && month <= 12) return 4;
};

module.exports = getQuarterFromDate;
