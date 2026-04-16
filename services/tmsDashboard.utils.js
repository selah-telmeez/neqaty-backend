const dayjs = require("dayjs");

/**
 * Groups tasks by month
 * @param {Array} tasks - raw tasks from DB
 * @param {Array} monthsArabic - month labels
 */
exports.groupTasksByMonth = (tasks, monthsArabic) => {
  const grouped = {};

  tasks.forEach(task => {
    const monthIndex = dayjs(task.createdAt).month(); // 0-11
    const monthNumber = monthIndex + 1;

    if (!grouped[monthNumber]) {
      grouped[monthNumber] = {
        monthNumber,
        monthName: monthsArabic[monthIndex],
        tasks: []
      };
    }

    grouped[monthNumber].tasks.push(task);
  });

  return Object.values(grouped).sort(
    (a, b) => a.monthNumber - b.monthNumber
  );
};