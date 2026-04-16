const roundNumber = require("../utils/roundNumber");

exports.buildDashboard = (groupedTasks) => {
  return groupedTasks.map(m => {
    const totals = m.tasks.reduce(
      (acc, task) => {
        acc.manager_quality += task.manager_quality || 0;
        acc.manager_speed += task.manager_speed || 0;
        acc.manager_status += task.manager_status || 0;
        acc.reviewer_quality += task.reviewer_quality || 0;
        acc.reviewer_speed += task.reviewer_speed || 0;
        acc.reviewer_status += task.reviewer_status || 0;
        return acc;
      },
      {
        manager_quality: 0,
        manager_speed: 0,
        manager_status: 0,
        reviewer_quality: 0,
        reviewer_speed: 0,
        reviewer_status: 0
      }
    );

    const count = m.tasks.length || 1;

    const manager_quality = totals.manager_quality / count;
    const manager_speed = totals.manager_speed / count;
    const manager_status = totals.manager_status / count;

    const reviewer_quality = totals.reviewer_quality / count;
    const reviewer_speed = totals.reviewer_speed / count;
    const reviewer_status = totals.reviewer_status / count;

    const quality_avg = (manager_quality + reviewer_quality) / 2;
    const speed_avg = (manager_speed + reviewer_speed) / 2;
    const status_avg = (manager_status + reviewer_status) / 2;

    const totalScore = (quality_avg + speed_avg + status_avg) / 3;
    return {
      ...m,
      tasksCount: count,
      performance: roundNumber(totalScore),
      manager_quality,
      manager_speed,
      manager_status,
      reviewer_quality,
      reviewer_speed,
      reviewer_status
    };
  });
};