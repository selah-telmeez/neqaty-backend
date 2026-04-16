const tmsRepository = require("../repositories/tmsRepository");
const { groupTasksByMonth } = require("./tmsDashboard.utils");
const { buildDashboard } = require("./tmsDashboard.builder");
const monthsArabic = require("../constants/monthsArabic");

exports.getDashboardData = async (filters) => {
  const tasks = await tmsRepository.fetchTasksForDashboard(filters);
  const groupedTasks = groupTasksByMonth(tasks, monthsArabic);
  return buildDashboard(groupedTasks);
};