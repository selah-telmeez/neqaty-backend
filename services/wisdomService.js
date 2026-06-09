const wisdomRepository = require("../repositories/wisdomRepository");
const wabysRepository = require("../repositories/wabysRepository");
const { calculateFormScore } = require("../utils/formScore");
const { calculateWisdomMonthlyScores, calculateWisdomTotalScore, fillMissingFormCodes } = require("./wisdom.monthlyScores");

exports.getWisdomDashboardData = async (year, stage, subject, specialization, fromDate, toDate) => {
  const dashboard = await wabysRepository.fetchDashboardData(year, 1, stage, subject, specialization, fromDate, toDate);
  const students = dashboard.students;
  const teachers = dashboard.teachers;
  const wisdomQuizTest = await wisdomRepository.fetchDashboardQuizTest(year, students, teachers, fromDate, toDate);
  const results = {
    total: {
      id: "All",
      en_name: "All",
      ar_name: "الكل",
      total_curriculums: 0,
      no_of_students: 0,
      no_of_teachers: 0,
      no_of_employees: 0,
      overall: 0,
      months: [],
    },
    organizations: {}
  };
  let totalScores = 0;

  const now = new Date();
  const selectedYear = Number(year);
  const currentYear = now.getFullYear();
  const currentMonth = currentYear === selectedYear ? now.getMonth() + 1 : 12;

  const fieldMap = new Map(dashboard.fields.map(f => [f.id, f.form_id]));
  const subFieldMap = new Map(dashboard.subFields.map(sf => [sf.id, fieldMap.get(sf.field_id)]));

  const formsW = dashboard.forms.filter(f => f.code.endsWith('| W'));
  const formWIds = formsW.map(f => f.id);

  const formsWCP = dashboard.forms.filter(f => f.code.endsWith('| WCP'));
  const formWCPIds = formsWCP.map(f => f.id);

  const formsEDU = dashboard.forms.filter(f => f.code.endsWith('| EDU'));
  const formEDUIds = formsEDU.map(f => f.id);

  const formsC = dashboard.forms.filter(f => f.code.endsWith('| C'));
  const formCIds = formsC.map(f => f.id);

  const formsT = dashboard.forms.filter(f => f.code.endsWith('| T'));
  const formTIds = formsT.map(f => f.id);

  const formsDO = dashboard.forms.filter(f => f.code.endsWith('| DO'));
  const formDOIds = formsDO.map(f => f.id);

  const formsFT = dashboard.forms.filter(f => f.code.endsWith('| FT'));
  const formFTIds = formsFT.map(f => f.id);

  const questionMaps = { W: {}, WCP: {}, EDU: {}, C: {}, T: {}, DO: {}, FT: {} };

  dashboard.questions.forEach(q => {
    const formId = subFieldMap.get(q.sub_field_id);
    if (formWIds.includes(formId)) questionMaps.W[q.id] = { form_id: formId, max_score: q.max_score };
    else if (formWCPIds.includes(formId)) questionMaps.WCP[q.id] = { form_id: formId, max_score: q.max_score };
    else if (formEDUIds.includes(formId)) questionMaps.EDU[q.id] = { form_id: formId, max_score: q.max_score };
    else if (formCIds.includes(formId)) questionMaps.C[q.id] = { form_id: formId, max_score: q.max_score };
    else if (formTIds.includes(formId)) questionMaps.T[q.id] = { form_id: formId, max_score: q.max_score };
    else if (formDOIds.includes(formId)) questionMaps.DO[q.id] = { form_id: formId, max_score: q.max_score };
    else if (formFTIds.includes(formId)) questionMaps.FT[q.id] = { form_id: formId, max_score: q.max_score };
  });

  function roundNumber(value) {
    return Math.round(value * 100) / 100;
  }

  const months = ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'];

  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
  const startMonth = (selectedYear === 2025) ? 4 : 1;
  const endMonth = (selectedYear === currentYear) ? currentMonth : 12;

  const ebdaeduEmployees = dashboard.ebdaeduEmployees.filter(emp => emp.organization_id === 3);
  const ebdaeduEmpUserIds = ebdaeduEmployees.map(emp => emp.user_id);
  let totalMonths = [];

  const monthlyTotals = Array.from({ length: 12 }, () => ({
    sum: 0,
    count: 0,
    overall: 0,
    EEBM: {
      totalEEBM: 0,
      W: { avgScore: 0, codeScores: [], scores: [] },
      WCP: { avgScore: 0, codeScores: [], scores: [] },
      TMS: { avgScore: 0 },
    },
    EPBM: {
      totalEPBM: 0,
      EDU: { avgScore: 0, codeScores: [], scores: [] },
      C: { avgScore: 0, codeScores: [], scores: [] },
      T: { avgScore: 0, codeScores: [], scores: [] },
    },
    ODBM: {
      totalODBM: 0,
      DO: { avgScore: 0, codeScores: [], scores: [] },
      STB: { avgScore: 0 },
      sessions: { avgScore: 0, scores: [] },
      STA: { avgScore: 0 },
    },
    TQBM: {
      totalTQBM: 0,
      TG: { avgScore: 0 },
      FT: { avgScore: 0 },
      CA: { avgScore: 0 },
    },
    APBM: {
      totalAPBM: 0,
      PRO: { avgScore: 0 },
      FO: { avgScore: 0 },
      SU: { avgScore: 0 },
    },
    GEEBM: {
      totalGEEBM: 0,
      EEBM: 0,
      EPBM: 0,
      ODBM: 0,
      TQBM: 0,
      APBM: 0,
    }
  }));

  for (const school of dashboard.organizations) {
    const relatedEmployees = dashboard.employees.filter(emp => emp.organization_id === school.id);
    const relatedEmpRole = relatedEmployees.map(emp => emp.role_id);
    const relatedEmpUserIds = relatedEmployees.map(emp => emp.user_id);
    const relatedEmpIds = relatedEmployees.map(emp => emp.id);
    const relatedTeachers = dashboard.teachers.filter(t => relatedEmpRole.includes(1) && relatedEmpIds.includes(t.employee_id));
    const relatedStudents = dashboard.students.filter(std => std.school_id === school.id);
    const relatedStdIds = relatedStudents.map(std => std.id);
    const relatedStdUserIds = relatedStudents.map(std => std.user_id);
    const usersIds = [...relatedStdUserIds, ...relatedEmpUserIds, ...ebdaeduEmpUserIds];
    const relatedUsersIds = [...relatedStdUserIds, ...relatedEmpUserIds];
    const relatedCurriculumReports = dashboard.allCurriculumReports.filter(report => report.organization_id === school.id && usersIds.includes(report.Assessor_id)) || [];
    const relatedCurriculumReportIds = relatedCurriculumReports.map(report => report.id) || [];
    const relatedIndividualReports = dashboard.allIndividualReports.filter(report => usersIds.includes(report.Assessee_id) && relatedUsersIds.includes(report.Assessor_id)) || [];
    const relatedIndividualReportIds = relatedIndividualReports.map(report => report.id) || [];
    const relatedEnvironmentReports = dashboard.allEnvironmentReports.filter(report => report.organization_id === school.id && usersIds.includes(report.user_id)) || [];
    const relatedEnvironmentReportIds = relatedEnvironmentReports.map(report => report.id) || [];
    const relatedCurriculumResults = dashboard.allCurriculumResults.filter(result => relatedCurriculumReportIds.includes(result.report_id)) || [];
    const relatedIndividualResults = dashboard.allIndividualResults.filter(result => relatedIndividualReportIds.includes(result.report_id)) || [];
    const relatedEnvironmentResults = dashboard.allEnvironmentResults.filter(result => relatedEnvironmentReportIds.includes(result.report_id)) || [];
    const relatedTasks = dashboard.tasks.filter(task => task['assignee.employee.organization_id'] === school.id);
    const relatedStdBehavior = dashboard.studentsBehavior.filter(std => relatedStdUserIds.includes(std.offender_id));
    const relatedSTA = dashboard.studentsAttendance.filter(sta => relatedStdIds.includes(sta.student_id));
    const attendedCount = relatedSTA.filter(s => s.status === 'attend').length;
    const allStudentsAttendance = relatedSTA.length > 0 ? (attendedCount / relatedSTA.length) * 100 : 0;
    const currentTeacherSessions = relatedTeachers.map(teacher => (teacher.actual_sessions / teacher.planned_sessions) * 100);
    const currentAvgSessions = currentTeacherSessions.length === 0 ? 0 : currentTeacherSessions.reduce((sum, v) => sum + v, 0) / currentTeacherSessions.length;
    const relatedQuizesTests = wisdomQuizTest.filter(quiz => quiz.template.organization_id === school.id)
    const groupedTemplates = Object.values(
      relatedQuizesTests.reduce((acc, item) => {
        const plainItem = item.get ? item.get({ plain: true }) : item;

        const template = plainItem.template;

        if (!template) return acc;

        if (!acc[template.id]) {
          acc[template.id] = {
            id: template.id,
            name: template.name,
            type: template.type,
            code: template.type,
            formDate: plainItem.createdAt,
            scores: [],
            average_score: 0
          };
        }

        acc[template.id].scores.push({
          student_id: plainItem.student_id,
          assessorName: 1,
          ReportedData: 2,
          teacher_id: plainItem.teacher_id,
          result: plainItem.result / 100
        });

        return acc;
      }, {})
    ).map(template => ({
      ...template,
      average_score:
        template.scores.reduce((sum, item) => sum + item.result, 0) /
        (template.scores.length || 1)
    }));

    const allPROForms = groupedTemplates.filter(form => form.type === "مشروع تخرج");
    const allFOForms = groupedTemplates.filter(form => form.type === "اختبار تكويني");
    const allSUForms = groupedTemplates.filter(form => form.type === "اختبار تجميعي");

    const [
      allWScore, allWCPScore,
      allEDUScore, allCScore, allTScore,
      allDOScore,
      allFTScore
    ] = await Promise.all([
      calculateFormScore(usersIds, relatedEnvironmentReports, relatedEnvironmentResults, questionMaps.W, formWIds, formsW, dashboard.employees, relatedStudents, dashboard.curriculums, dashboard.organizations),
      calculateFormScore(usersIds, relatedEnvironmentReports, relatedEnvironmentResults, questionMaps.WCP, formWCPIds, formsWCP, dashboard.employees, relatedStudents, dashboard.curriculums, dashboard.organizations),
      calculateFormScore(usersIds, relatedEnvironmentReports, relatedEnvironmentResults, questionMaps.EDU, formEDUIds, formsEDU, dashboard.employees, relatedStudents, dashboard.curriculums, dashboard.organizations),
      calculateFormScore(usersIds, relatedCurriculumReports, relatedCurriculumResults, questionMaps.C, formCIds, formsC, dashboard.employees, relatedStudents, dashboard.curriculums, dashboard.organizations),
      calculateFormScore(usersIds, relatedIndividualReports, relatedIndividualResults, questionMaps.T, formTIds, formsT, dashboard.employees, relatedStudents, dashboard.curriculums, dashboard.organizations),
      calculateFormScore(usersIds, relatedEnvironmentReports, relatedEnvironmentResults, questionMaps.DO, formDOIds, formsDO, dashboard.employees, relatedStudents, dashboard.curriculums, dashboard.organizations),
      calculateFormScore(usersIds, relatedEnvironmentReports, relatedEnvironmentResults, questionMaps.FT, formFTIds, formsFT, dashboard.employees, relatedStudents, dashboard.curriculums, dashboard.organizations)
    ]);

    const overAllScore = calculateWisdomTotalScore(
      allWScore,
      allWCPScore,
      allEDUScore,
      allCScore,
      allTScore,
      allDOScore,
      allFTScore,
      relatedTasks,
      relatedStdBehavior,
      dashboard.students,
      allPROForms,
      allFOForms,
      allSUForms,
      start,
      end)

    const resultsThisRun = Array.from({ length: (selectedYear === currentYear) ? currentMonth : 12 }, (_, i) => {
      const month1 = i + 1;
      return calculateWisdomMonthlyScores(
        year, month1,
        allWScore, allWCPScore, allEDUScore, allCScore, allTScore,
        allFTScore,
        allDOScore,
        allPROForms,
        allFOForms,
        allSUForms,
        relatedTasks, relatedStdBehavior, relatedStudents,
      );
    });

    resultsThisRun.forEach((r, i) => {
      monthlyTotals[i].sum += r.performance; // r.performance is your totalScore for that month
      monthlyTotals[i].count += 1;
      monthlyTotals[i].EEBM.totalEEBM += r.eebm;
      monthlyTotals[i].EEBM.W.avgScore += r.W;
      monthlyTotals[i].EEBM.WCP.avgScore += r.WCP;
      monthlyTotals[i].EEBM.TMS.avgScore += r.TMS;
      monthlyTotals[i].EPBM.totalEPBM += r.epbm;
      monthlyTotals[i].EPBM.EDU.avgScore += r.EDU;
      monthlyTotals[i].EPBM.C.avgScore += r.C;
      monthlyTotals[i].EPBM.T.avgScore += r.T;
      monthlyTotals[i].ODBM.totalODBM += r.odbm;
      monthlyTotals[i].ODBM.DO.avgScore += r.DO;
      monthlyTotals[i].ODBM.STB.avgScore += r.STB;
      monthlyTotals[i].TQBM.totalTQBM += r.tqbm;
      monthlyTotals[i].TQBM.FT.avgScore += r.FT;
      monthlyTotals[i].ODBM.STA.avgScore += allStudentsAttendance;
      monthlyTotals[i].APBM.totalAPBM += r.apbm;
      monthlyTotals[i].APBM.PRO.avgScore += r.PRO;
      monthlyTotals[i].APBM.FO.avgScore += r.FO;
      monthlyTotals[i].APBM.SU.avgScore += r.SU;
      monthlyTotals[i].GEEBM.totalGEEBM += r.geebm;
      monthlyTotals[i].GEEBM.EEBM += r.eebm;
      monthlyTotals[i].GEEBM.EPBM += r.epbm;
      monthlyTotals[i].GEEBM.ODBM += r.odbm;
      monthlyTotals[i].GEEBM.APBM += r.apbm;
      monthlyTotals[i].GEEBM.TQBM += r.tqbm;
    });

    const monthlySums = [];
    for (let m = startMonth; m <= endMonth; m++) {
      const i = m - 1;
      const perf = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].sum / monthlyTotals[i].count) : 0;
      const EEBM = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].EEBM.totalEEBM / monthlyTotals[i].count) : 0;
      const EEBMW = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].EEBM.W.avgScore / monthlyTotals[i].count) : 0;
      const EEBMWCP = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].EEBM.WCP.avgScore / monthlyTotals[i].count) : 0;
      const EEBMTMS = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].EEBM.TMS.avgScore / monthlyTotals[i].count) : 0;
      const EPBM = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].EPBM.totalEPBM / monthlyTotals[i].count) : 0;
      const EPBMEDU = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].EPBM.EDU.avgScore / monthlyTotals[i].count) : 0;
      const EPBMC = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].EPBM.C.avgScore / monthlyTotals[i].count) : 0;
      const EPBMT = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].EPBM.T.avgScore / monthlyTotals[i].count) : 0;
      const ODBM = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].ODBM.totalODBM / monthlyTotals[i].count) : 0;
      const ODBMDO = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].ODBM.DO.avgScore / monthlyTotals[i].count) : 0;
      const ODBMSTB = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].ODBM.STB.avgScore / monthlyTotals[i].count) : 0;
      const TQBM = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].TQBM.totalTQBM / monthlyTotals[i].count) : 0;
      const TQBMFT = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].TQBM.FT.avgScore / monthlyTotals[i].count) : 0;
      const ODBMSTA = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].ODBM.STA.avgScore / monthlyTotals[i].count) : 0;
      const ODBMSessions = (currentAvgSessions && m === endMonth) ? roundNumber(currentAvgSessions / monthlyTotals[i].count) : 0;
      const APBM = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].APBM.totalAPBM / monthlyTotals[i].count) : 0;
      const APBMPRO = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].APBM.PRO.avgScore / monthlyTotals[i].count) : 0;
      const APBMFO = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].APBM.FO.avgScore / monthlyTotals[i].count) : 0;
      const APBMSU = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].APBM.SU.avgScore / monthlyTotals[i].count) : 0;
      const GEEBM = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].GEEBM.totalGEEBM / monthlyTotals[i].count) : 0;

      monthlySums.push({
        month: months[i],
        monthNumber: m,
        performance: perf,
        codes: [],
        EEBM: { totalEEBM: EEBM, W: { avgScore: EEBMW }, WCP: { avgScore: EEBMWCP }, TMS: { avgScore: EEBMTMS } },
        EPBM: { totalEPBM: EPBM, EDU: { avgScore: EPBMEDU }, C: { avgScore: EPBMC }, T: { avgScore: EPBMT } },
        ODBM: { totalODBM: ODBM, DO: { avgScore: ODBMDO }, STB: { avgScore: ODBMSTB }, STA: { avgScore: ODBMSTA }, sessions: { avgScore: ODBMSessions } },
        TQBM: { totalTQBM: TQBM, FT: { avgScore: TQBMFT } },
        APBM: { totalAPBM: APBM, PRO: { avgScore: APBMPRO }, FO: { avgScore: APBMFO }, SU: { avgScore: APBMSU } },
        GEEBM: { totalGEEBM: GEEBM, ODBM: roundNumber(ODBM * 0.2), APBM: roundNumber(APBM * 0.2), TQBM: roundNumber(TQBM * 0.2), EEBM: roundNumber(EEBM * 0.2) },
        color: '#ef4444'
      });
    }
    totalMonths = monthlySums
    const totalOrgMonths = resultsThisRun.filter(month => month.monthNumber >= startMonth && month.monthNumber <= currentMonth);
    const monthlySums2 = [];
    for (let m = startMonth; m <= endMonth; m++) {
      const currentMonthData = totalOrgMonths.find(month => month.monthNumber === m);
      if (!currentMonthData) continue;

      fillMissingFormCodes(currentMonthData, formsW, "wCodes");
      fillMissingFormCodes(currentMonthData, formsWCP, "wcpCodes");
      fillMissingFormCodes(currentMonthData, formsEDU, "eduCodes");
      fillMissingFormCodes(currentMonthData, formsC, "cCodes");
      fillMissingFormCodes(currentMonthData, formsT, "tCodes");
      fillMissingFormCodes(currentMonthData, formsFT, "ftCodes");
      fillMissingFormCodes(currentMonthData, formsDO, "doCodes");

      const perf = roundNumber(currentMonthData.performance || 0);
      const EEBM = roundNumber(currentMonthData.eebm || 0);
      const EEBMW = roundNumber(currentMonthData.W || 0);
      const EEBMWCP = roundNumber(currentMonthData.WCP || 0);
      const EEBMTMS = roundNumber(currentMonthData.TMS || 0);
      const EPBM = roundNumber(currentMonthData.epbm || 0);
      const EPBMEDU = roundNumber(currentMonthData.EDU || 0);
      const EPBMC = roundNumber(currentMonthData.C || 0);
      const EPBMT = roundNumber(currentMonthData.T || 0);
      const ODBM = roundNumber(currentMonthData.odbm || 0);
      const ODBMDO = roundNumber(currentMonthData.DO || 0);
      const ODBMSTA = roundNumber(allStudentsAttendance || 0);
      const ODBMSTB = roundNumber(currentMonthData.STB || 0);
      const ODBMSessions = m === endMonth ? roundNumber(currentAvgSessions || 0) : 0;
      const TQBM = roundNumber(currentMonthData.tqbm || 0);
      const TQBMFT = roundNumber(currentMonthData.FT || 0);
      const APBM = roundNumber(currentMonthData.apbm || 0);
      const APBMPRO = roundNumber(currentMonthData.PRO || 0);
      const APBMFO = roundNumber(currentMonthData.FO || 0);
      const APBMSU = roundNumber(currentMonthData.SU || 0);
      const GEEBM = roundNumber(currentMonthData.geebm || 0);
      monthlySums2.push({
        month: currentMonthData.month,
        monthNumber: m,
        performance: perf,
        EEBM: {
          totalEEBM: EEBM,
          W: { avgScore: EEBMW, codeScores: currentMonthData.wCodes, scores: currentMonthData.eachW, no_of_forms: currentMonthData.eachW.length },
          WCP: { avgScore: EEBMWCP, codeScores: currentMonthData.wcpCodes, scores: currentMonthData.eachWCP, no_of_forms: currentMonthData.eachWCP.length },
          TMS: { avgScore: EEBMTMS },
        },
        EPBM: {
          totalEPBM: EPBM,
          EDU: { avgScore: EPBMEDU, codeScores: currentMonthData.eduCodes, scores: currentMonthData.eachEDU, no_of_forms: currentMonthData.eachEDU.length },
          C: { avgScore: EPBMC, codeScores: currentMonthData.cCodes, scores: currentMonthData.eachC, no_of_forms: currentMonthData.eachC.length },
          T: { avgScore: EPBMT, codeScores: currentMonthData.tCodes, scores: currentMonthData.eachT, no_of_forms: currentMonthData.eachT.length },
        },
        ODBM: {
          totalODBM: ODBM,
          DO: { avgScore: ODBMDO, codeScores: currentMonthData.doCodes, scores: currentMonthData.eachDO, no_of_forms: currentMonthData.eachDO.length },
          STA: { avgScore: ODBMSTA },
          STB: { avgScore: ODBMSTB },
          sessions: { avgScore: ODBMSessions }
        },
        TQBM: {
          totalTQBM: TQBM,
          FT: { avgScore: TQBMFT, codeScores: currentMonthData.ftCodes, scores: currentMonthData.eachFT, no_of_forms: currentMonthData.eachFT.length },
        },
        APBM: {
          totalAPBM: APBM,
          PRO: { avgScore: APBMPRO, codeScores: currentMonthData.proCodes, scores: currentMonthData.eachPRO, no_of_forms: currentMonthData.eachPRO.length },
          FO: { avgScore: APBMFO, codeScores: currentMonthData.foCodes, scores: currentMonthData.eachFO, no_of_forms: currentMonthData.eachFO.length },
          SU: { avgScore: APBMSU, codeScores: currentMonthData.suCodes, scores: currentMonthData.eachSU, no_of_forms: currentMonthData.eachSU.length },
        },
        GEEBM: {
          totalGEEBM: GEEBM,
          EEBM: roundNumber(EEBM * 0.2),
          EPBM: roundNumber(EPBM * 0.2),
          ODBM: roundNumber(ODBM * 0.2),
          APBM: roundNumber(APBM * 0.2),
          TQBM: roundNumber(TQBM * 0.2),
        },
        color: '#ef4444'
      });
    }

    totalScores += overAllScore.totalScore;
    results.organizations[school.id] = {
      id: school.id,
      name: dashboard.organizations.find(org => org.id === school.id).name,
      // location: orgLocation || "",
      managerFirstName: relatedEmployees.find(emp => emp.role_id === 4)?.first_name,
      managerMiddleName: relatedEmployees.find(emp => emp.role_id === 4)?.middle_name,
      managerLastName: relatedEmployees.find(emp => emp.role_id === 4)?.last_name,
      principalFirstName: relatedEmployees.find(emp => emp.role_id === 3)?.first_name,
      principalMiddleName: relatedEmployees.find(emp => emp.role_id === 3)?.middle_name,
      principalLastName: relatedEmployees.find(emp => emp.role_id === 3)?.last_name,
      no_of_employees: relatedEmployees?.length,
      no_of_teachers: relatedTeachers?.length,
      no_of_students: relatedStudents?.length,
      overall: overAllScore?.totalScore,
      months: monthlySums2
    }

    results.total.months = totalMonths;
    results.total.overall = totalScores / dashboard.organizations.length;
    results.total.total_curriculums = dashboard.curriculums.length;
    results.total.no_of_employees = dashboard.employees.length;
    results.total.no_of_teachers = dashboard.teachers.length;
    results.total.no_of_students = dashboard.students.length;
  }

  return results;
};

exports.getWisdomDashboardGeneralInfoData = async () => {
  const generalInfo = await wabysRepository.fetchDashboardGeneralInfoData(1);

  const result = {
    All: {
      organizations: generalInfo.organizations,
      managers: [],
      students: [],
      workshops: 0,
      classes: 0,
      admins: [],
      teachers: [],
      labs: 0,
      employees: generalInfo.employees,
    },
  };

  // used to merge all teachers and students later
  const allTeachersBySubjectMap = new Map();
  const allStudentsBySpecializationMap = new Map();

  for (const school of generalInfo.organizations) {
    const relatedSchool = generalInfo?.schools?.find(sch => Number(sch.organizationId) === Number(school?.id));
    const relatedEmployees = generalInfo.employees.filter(
      emp => emp.organization_id === school.id
    );

    const relatedEmployeeIds = relatedEmployees.map(emp => emp.id);

    const academicPrinciple = relatedEmployees.filter(emp => emp.role_id === 3);
    const exectiveManager = relatedEmployees.filter(emp => emp.role_id === 4);
    const admins = relatedEmployees.filter(emp => emp.role_id !== 1 && emp.role_id !== 2);

    const relatedStudents = generalInfo.students.filter(
      std => std.school_id === school.id
    );

    const relatedTeachers = generalInfo.teachers.filter(teacher =>
      relatedEmployeeIds.includes(teacher.employee_id)
    );

    // attach subject_id to teacher employees
    const relatedTeachersEmployees = relatedEmployees
      .filter(emp => relatedTeachers.some(t => t.employee_id === emp.id))
      .map(emp => {
        const teacher = relatedTeachers.find(t => t.employee_id === emp.id);
        return {
          ...emp,
          subject_id: teacher?.subject_id ?? null,
        };
      });

    // ===== GROUP TEACHERS BY SUBJECT (ARRAY) =====
    const teachersBySubjectMap = new Map();

    for (const teacher of relatedTeachersEmployees) {
      const subjectId = teacher.subject_id;
      const subject = generalInfo.subjects.find(s => s.id === subjectId) || null;

      if (!teachersBySubjectMap.has(subjectId)) {
        teachersBySubjectMap.set(subjectId, {
          subject,
          teachers: [],
        });
      }

      teachersBySubjectMap.get(subjectId).teachers.push(teacher);
    }

    const groupedTeachers = Array.from(teachersBySubjectMap.values());

    // ===== GROUP STUDENTS BY SUBJECT (ARRAY) =====
    const studentsBySpecializationMap = new Map();

    for (const student of relatedStudents) {
      const specializationId = student.specialization_id;
      const specialization = generalInfo.specializations.find(s => s.id === specializationId) || null;

      if (!studentsBySpecializationMap.has(specializationId)) {
        studentsBySpecializationMap.set(specializationId, {
          specialization,
          students: [],
        });
      }

      studentsBySpecializationMap.get(specializationId).students.push(student);
    }

    const groupedStudents = Array.from(studentsBySpecializationMap.values());
    // store per school
    result[school.id] = {
      organization: school,
      employees: relatedEmployees,
      managers: [...academicPrinciple, ...exectiveManager],
      admins,
      teachers: groupedTeachers,
      students: groupedStudents,
      workshops: relatedSchool?.no_of_workshops || 0,
      labs: relatedSchool?.no_of_labs || 0,
      classes: relatedSchool?.no_of_classes || 0
    };

    // ===== ACCUMULATE "ALL" =====
    result.All.managers.push(...academicPrinciple, ...exectiveManager);
    result.All.admins.push(...admins);
    result.All.workshops += relatedSchool?.no_of_workshops || 0;
    result.All.labs += relatedSchool?.no_of_labs || 0;
    result.All.classes += relatedSchool?.no_of_classes || 0;
    // 
    for (const group of groupedTeachers) {
      const subjectId = group.subject?.id ?? null;

      if (!allTeachersBySubjectMap.has(subjectId)) {
        allTeachersBySubjectMap.set(subjectId, {
          subject: group.subject,
          teachers: [],
        });
      }

      allTeachersBySubjectMap.get(subjectId).teachers.push(
        ...group.teachers
      );
    }

    for (const group of groupedStudents) {
      const specializationId = group.specialization?.id ?? null;

      if (!allStudentsBySpecializationMap.has(specializationId)) {
        allStudentsBySpecializationMap.set(specializationId, {
          specialization: group.specialization,
          students: [],
        });
      }

      allStudentsBySpecializationMap.get(specializationId).students.push(
        ...group.students
      );
    }
  }

  // finalize All.teachers and All.students as ARRAY grouped by subject
  result.All.teachers = Array.from(allTeachersBySubjectMap.values());
  result.All.students = Array.from(allStudentsBySpecializationMap.values());

  return result;
};

exports.getWisdomRelatedSchoolsData = async () => {
  const schools = await wabysRepository.fetchRelatedSchoolsPerSystemData(1);

  return schools;
};

exports.getWisdomStagesData = async () => {
  const stages = await wabysRepository.fetchAllStagesData();
  const result = stages.map(stage => {
    const specializationMap = new Map();

    stage.classes?.forEach(cls => {
      cls.students?.forEach(student => {
        if (student.specialization) {
          specializationMap.set(
            student.specialization.id,
            student.specialization
          );
        }
      });
    });

    return {
      id: stage.id,
      name: stage.name,
      specializations: Array.from(specializationMap.values())
    };
  });
  const wisdomStages = result.filter(stage => stage.id === 1 || stage.id === 2 || stage.id === 3);
  return wisdomStages;
}

exports.getWisdomSubjectsData = async () => {
  const loadSubjects = await wabysRepository.fetchAllSubjectsData();

  return loadSubjects.map(subject => {
    const stageMap = new Map();
    const specializationMap = new Map();

    subject.specializations?.forEach(ss => {
      const specialization = ss.specialization;
      if (!specialization) return;

      specializationMap.set(specialization.id, {
        id: specialization.id,
        name: specialization.name
      });

      specialization.students?.forEach(student => {
        const stageId = student.class?.stage_id;
        if (!stageId) return;

        stageMap.set(stageId, {
          id: stageId
        });
      });
    });

    return {
      id: subject.id,
      name: subject.name,
      stages: Array.from(stageMap.values()),
      specializations: Array.from(specializationMap.values())
    };
  });
};

exports.getWisdomSpecializationsData = async () => {
  const specializations = await wabysRepository.fetchAllSpecializationsData();
  return specializations.map(specialization => {
    const stageMap = new Map();
    const subjectMap = new Map();

    specialization?.subject?.forEach(ss => {
      const subject = ss.subject;
      if (!subject) return;

      subjectMap.set(subject.id, {
        id: subject.id,
        name: subject.name
      });

      specialization.students?.forEach(student => {
        const stageId = student.class?.stage_id;
        if (!stageId) return;

        stageMap.set(stageId, {
          id: stageId
        });
      });
    });

    return {
      id: specialization.id,
      name: specialization.name,
      stages: Array.from(stageMap.values()),
      subject: Array.from(subjectMap.values())
    };
  });
}

exports.getWisdomFormsData = async () => {
  const forms = await wabysRepository.fetchRelatedFormsData();
  const wisdomForms = forms.filter(
    (filter) =>
      filter.type !== "ClassRoom Observation" &&
      filter.type !== "curriculum" &&
      filter.type !== "normal2" &&
      filter.type !== "Watoms ClassRoom Observation" &&
      filter.code !== "Cl | PD"
  )

  return wisdomForms;
}

exports.postWisdomCreateGradebookData = async (data) => {
  const wisdomData = {
    ...data,
    status: "in progress"
  }
  const gradebook = await wabysRepository.insertNewGradebookData(wisdomData);
  return gradebook;
}

exports.getWisdomGradebooksData = async () => {
  const gradebook = await wabysRepository.fetchSystemRelatedGradebooksData(1);
  return gradebook;
}

exports.postWisdomInsertGradebookData = async (data) => {
  const gradebook = await wabysRepository.insertGradebookScoreData(data);
  return gradebook;
}

exports.postWisdomInsertTeacherAbsenceData = async (data) => {
  const teacherAbsence = await wabysRepository.insertTeacherAbsenceData(data);
  return teacherAbsence;
}

exports.getWisdomStudentsData = async () => {
  const students = await wabysRepository.fetchSystemRelatedStudentsOrTrainees(1);
  return students
}

exports.getWisdomTeachersData = async () => {
  const teachers = await wabysRepository.fetchSystemRelatedTeachersOrTrainers(1);
  return teachers
}

exports.getClassRoomsData = async () => {
  return await wabysRepository.fetchSystemRelatedClassRooms(1);
};

exports.getSpecializationsData = async () => {
  return await wabysRepository.fetchSystemRelatedSpecializations(1);
};

exports.getSubjectsData = async () => {
  const subjects = await wabysRepository.fetchSystemRelatedSubjects(1);

  return subjects.map(subject => {
    const plainSubject = subject.get({ plain: true });

    const organizationsMap = new Map();

    plainSubject.teachers?.forEach(teacher => {
      const organization = teacher.employee?.organization;

      if (organization) {
        organizationsMap.set(organization.id, organization);
      }
    });

    return {
      id: plainSubject.id,
      name: plainSubject.name,
      category_id: plainSubject.category_id,
      organizations: Array.from(organizationsMap.values()),
    };
  });
};

exports.getClassesData = async () => {
  return await wabysRepository.fetchSystemRelatedClasses(1);
};

exports.getDepartmentsData = async () => {
  const departments =  await wabysRepository.fetchSystemRelatedDepartments(1);

  return departments.map(department => {
    const plainDepartment = department.get({ plain: true });

    const organizationsMap = new Map();

    plainDepartment.teachers?.forEach(teacher => {
      const organization = teacher.employee?.organization;

      if (organization) {
        organizationsMap.set(organization.id, organization);
      }
    });

    return {
      id: plainDepartment.id,
      name: plainDepartment.Name,
      organizations: Array.from(organizationsMap.values()),
    };
  });
};

exports.getGradeBooksScoresData = async (id) => {
  return await wisdomRepository.fetchWisdomGradebookScores(id);
};