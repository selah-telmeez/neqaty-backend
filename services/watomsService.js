const wabysRepository = require("../repositories/wabysRepository");
const watomsRepository = require("../repositories/watomsRepository");
const { calculateFormScore } = require("../utils/formScore");
const { calculateWatomsTotalScore, calculateWatomsEachMonthScore, fillWatomsMissingCodes } = require("./watoms.monthlyScores");

exports.getWatomsRelatedVtcsData = async () => {
    const vtcs = await wabysRepository.fetchRelatedSchoolsPerSystemData(2);

    return vtcs;
};

exports.getWatomsDashboardData = async (year, stage, subject, specialization, fromDate, toDate, userOrganization) => {
    const dashboard = await wabysRepository.fetchDashboardData(year, 2, stage, subject, specialization, fromDate, toDate);
    const results = {
        total: {
            id: "All",
            en_name: "All",
            ar_name: "الكل",
            totalCurriculums: 0,
            no_of_trainees: 0,
            no_of_trainers: 0,
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
    const currentDay = now.getDate();

    const fieldMap = new Map(dashboard.fields.map(f => [f.id, f.form_id]));
    const subFieldMap = new Map(dashboard.subFields.map(sf => [sf.id, fieldMap.get(sf.field_id)]));

    const formsTG = dashboard.forms.filter(f => f.code.endsWith('| TG'));
    const formTGIds = formsTG.map(f => f.id);

    const formsTE = dashboard.forms.filter(f => f.code.endsWith('| TE'));
    const formTEIds = formsTE.map(f => f.id);

    const formsT = dashboard.forms.filter(f => f.code.endsWith('| T'));
    const formTIds = formsT.map(f => f.id);

    const formsIP = dashboard.forms.filter(f => f.code.endsWith('| IP'));
    const formIPIds = formsIP.map(f => f.id);

    const formsDD = dashboard.forms.filter(f => f.code.endsWith('| DD'));
    const formDDIds = formsDD.map(f => f.id);

    const formsPO = dashboard.forms.filter(f => f.code.endsWith('| PO'));
    const formPOIds = formsPO.map(f => f.id);

    const formsQD = dashboard.forms.filter(f => f.code.endsWith('| QD'));
    const formQDIds = formsQD.map(f => f.id);

    const formsW = dashboard.forms.filter(f => f.code.endsWith('| W'));
    const formWIds = formsW.map(f => f.id);

    const formsTR = dashboard.forms.filter(f => f.code.endsWith('| TR'));
    const formTRIds = formsTR.map(f => f.id);

    const formsCP = dashboard.forms.filter(f => f.code.endsWith('| CP'));
    const formCPIds = formsCP.map(f => f.id);

    const formsCRO = dashboard.forms.filter(f => f.code.endsWith('| CRO'));
    const formCROIds = formsCRO.map(f => f.id);

    const questionMaps = { TG: {}, TE: {}, T: {}, IP: {}, DD: {}, PO: {}, QD: {}, W: {}, TR: {}, CP: {}, CRO: {} };

    dashboard.questions.forEach(q => {
        const formId = subFieldMap.get(q.sub_field_id);
        if (formTGIds.includes(formId)) questionMaps.TG[q.id] = { form_id: formId, max_score: q.max_score };
        else if (formTEIds.includes(formId)) questionMaps.TE[q.id] = { form_id: formId, max_score: q.max_score };
        else if (formTIds.includes(formId)) questionMaps.T[q.id] = { form_id: formId, max_score: q.max_score };
        else if (formIPIds.includes(formId)) questionMaps.IP[q.id] = { form_id: formId, max_score: q.max_score };
        else if (formDDIds.includes(formId)) questionMaps.DD[q.id] = { form_id: formId, max_score: q.max_score };
        else if (formPOIds.includes(formId)) questionMaps.PO[q.id] = { form_id: formId, max_score: q.max_score };
        else if (formQDIds.includes(formId)) questionMaps.QD[q.id] = { form_id: formId, max_score: q.max_score };
        else if (formWIds.includes(formId)) questionMaps.W[q.id] = { form_id: formId, max_score: q.max_score };
        else if (formTRIds.includes(formId)) questionMaps.TR[q.id] = { form_id: formId, max_score: q.max_score };
        else if (formCPIds.includes(formId)) questionMaps.CP[q.id] = { form_id: formId, max_score: q.max_score };
        else if (formCROIds.includes(formId)) questionMaps.CRO[q.id] = { form_id: formId, max_score: q.max_score };
    });

    function roundNumber(value) {
        return Math.round(value * 100) / 100;
    }

    const months = ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'];

    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
    const startMonth = (selectedYear === 2025) ? 4 : 1;
    const endMonth = ((currentDay >= 25 || Number(userOrganization) === 3) && selectedYear === currentYear) ?
        currentMonth
        : (selectedYear !== currentYear) ?
            12
            :
            currentMonth - 1;

    const ebdaeduEmployees = dashboard.ebdaeduEmployees.filter(emp => emp.organization_id === 3);
    const ebdaeduEmpUserIds = ebdaeduEmployees.map(emp => emp.user_id);
    let totalMonths = [];

    for (const school of dashboard.organizations) {
        const relatedEmployees = dashboard.employees.filter(emp => emp.organization_id === school.id);
        const relatedEmployeesAndEbdaEdu = [...relatedEmployees, ...ebdaeduEmployees];
        const relatedEmpRole = relatedEmployees.map(emp => emp.role_id);
        const relatedEmpUserIds = relatedEmployees.map(emp => emp.user_id);
        const relatedEmpIds = relatedEmployees.map(emp => emp.id);
        const relatedTeachers = dashboard.teachers.filter(t => relatedEmpRole.includes(1) && relatedEmpIds.includes(t.employee_id));
        const relatedTeachersIds = relatedTeachers.map(t => t.id);
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
        const relatedTeachersEvaluation = dashboard.teachersEvaluation.filter(teacher => relatedTeachersIds.includes(teacher.teacher_id));
        const orgManager = relatedEmployees.filter(emp => emp.role_id === 29);

        const [
            allTGScore, allTEScore, allTScore, allIPScore,
            allDDScore, allPOScore, allQDScore, allWScore,
            allTRScore, allCPScore, allCROScore
        ] = await Promise.all([
            calculateFormScore(usersIds, relatedCurriculumReports, relatedCurriculumResults, questionMaps.TG, formTGIds, formsTG, relatedEmployeesAndEbdaEdu, relatedStudents, dashboard.curriculums, dashboard.organizations),
            calculateFormScore(usersIds, relatedCurriculumReports, relatedCurriculumResults, questionMaps.TE, formTEIds, formsTE, relatedEmployeesAndEbdaEdu, relatedStudents, dashboard.curriculums, dashboard.organizations),
            calculateFormScore(usersIds, relatedIndividualReports, relatedIndividualResults, questionMaps.T, formTIds, formsT, relatedEmployeesAndEbdaEdu, relatedStudents, dashboard.curriculums, dashboard.organizations),
            calculateFormScore(usersIds, relatedEnvironmentReports, relatedEnvironmentResults, questionMaps.IP, formIPIds, formsIP, relatedEmployeesAndEbdaEdu, relatedStudents, dashboard.curriculums, dashboard.organizations),
            calculateFormScore(usersIds, relatedEnvironmentReports, relatedEnvironmentResults, questionMaps.DD, formDDIds, formsDD, relatedEmployeesAndEbdaEdu, relatedStudents, dashboard.curriculums, dashboard.organizations),
            calculateFormScore(usersIds, relatedEnvironmentReports, relatedEnvironmentResults, questionMaps.PO, formPOIds, formsPO, relatedEmployeesAndEbdaEdu, relatedStudents, dashboard.curriculums, dashboard.organizations),
            calculateFormScore(usersIds, relatedEnvironmentReports, relatedEnvironmentResults, questionMaps.QD, formQDIds, formsQD, relatedEmployeesAndEbdaEdu, relatedStudents, dashboard.curriculums, dashboard.organizations),
            calculateFormScore(usersIds, relatedEnvironmentReports, relatedEnvironmentResults, questionMaps.W, formWIds, formsW, relatedEmployeesAndEbdaEdu, relatedStudents, dashboard.curriculums, dashboard.organizations),
            calculateFormScore(usersIds, relatedIndividualReports, relatedIndividualResults, questionMaps.TR, formTRIds, formsTR, relatedEmployeesAndEbdaEdu, relatedStudents, dashboard.curriculums, dashboard.organizations),
            calculateFormScore(usersIds, relatedEnvironmentReports, relatedEnvironmentResults, questionMaps.CP, formCPIds, formsCP, relatedEmployeesAndEbdaEdu, relatedStudents, dashboard.curriculums, dashboard.organizations),
            calculateFormScore(usersIds, relatedIndividualReports, relatedIndividualResults, questionMaps.CRO, formCROIds, formsCRO, relatedEmployeesAndEbdaEdu, relatedStudents, dashboard.curriculums, dashboard.organizations)
        ]);
        const overAllScore = calculateWatomsTotalScore(
            allTGScore,
            allTEScore,
            allTScore,
            allIPScore,
            allDDScore,
            allPOScore,
            allQDScore,
            allWScore,
            allTRScore,
            allCPScore,
            allCROScore,
            allStudentsAttendance,
            relatedTeachersEvaluation,
            start,
            end);

        const resultsThisRun = Array.from({ length: ((currentDay >= 25 || Number(userOrganization) === 3) && selectedYear === currentYear) ? currentMonth : (selectedYear !== currentYear) ? 12 : currentMonth - 1 }, (_, i) => {
            const month1 = i + 1;
            return calculateWatomsEachMonthScore(
                selectedYear,
                month1,
                allTGScore,
                allTEScore,
                allTScore,
                allIPScore,
                allDDScore,
                allPOScore,
                allQDScore,
                allWScore,
                allTRScore,
                allCROScore,
                relatedSTA,
                relatedTeachersEvaluation,
                allCPScore
            );
        });

        const monthlyTotals = Array.from({ length: 12 }, () => ({
            sum: 0,
            count: 0,
            overall: 0,
            TQBM: {
                totalTQBM: 0,
                TG: { avgScore: 0, codeScores: [], scores: [] },
                TE: { avgScore: 0, codeScores: [], scores: [] },
                T: { avgScore: 0, codeScores: [], scores: [] }
            },
            GOVBM: {
                totalGOVBM: 0,
                IP: { avgScore: 0, codeScores: [], scores: [] },
                DD: { avgScore: 0, codeScores: [], scores: [] },
                PO: { avgScore: 0, codeScores: [], scores: [] },
                QD: { avgScore: 0, codeScores: [], scores: [] },
                W: { avgScore: 0, codeScores: [], scores: [] }
            },
            ACBM: {
                totalACBM: 0,
                TG: { avgScore: 0, codeScores: [], scores: [] },
                TR: { avgScore: 0, codeScores: [], scores: [] }
            },
            GEEBM: {
                totalGEEBM: 0,
                TQBM: 0,
                GOVBM: 0,
                ACBM: 0,
                TRA: 0,
                TV: { avgScore: 0, codeScores: [], scores: [] },
                CP: { avgScore: 0, codeScores: [], scores: [] }
            }
        }));
        let TQBM = { totalTQBM: 0, TG: { avgScore: 0, scores: [] }, TE: { avgScore: 0, scores: [] }, T: { avgScore: 0, scores: [] } };
        let GOVBM = { totalGOVBM: 0, IP: { avgScore: 0, scores: [] }, DD: { avgScore: 0, scores: [] }, PO: { avgScore: 0, scores: [] }, QD: { avgScore: 0, scores: [] }, W: { avgScore: 0, scores: [] } };
        let ACBM = { totalACBM: 0, TR: { avgScore: 0, scores: [] }, TG: { avgScore: 0, scores: [] } };

        resultsThisRun.forEach((r, i) => {
            monthlyTotals[i].sum += r.performance;
            monthlyTotals[i].count += 1;
            monthlyTotals[i].TQBM.totalTQBM += r.tqbm;
            monthlyTotals[i].TQBM.TG.avgScore += r.tqbmtg;
            monthlyTotals[i].TQBM.TE.avgScore += r.te;
            monthlyTotals[i].TQBM.T.avgScore += r.t;
            monthlyTotals[i].GOVBM.totalGOVBM += r.govbm;
            monthlyTotals[i].GOVBM.IP.avgScore += r.ip;
            monthlyTotals[i].GOVBM.DD.avgScore += r.dd;
            monthlyTotals[i].GOVBM.PO.avgScore += r.po;
            monthlyTotals[i].GOVBM.QD.avgScore += r.qd;
            monthlyTotals[i].GOVBM.W.avgScore += r.w;
            monthlyTotals[i].ACBM.totalACBM += r.acbm;
            monthlyTotals[i].ACBM.TG.avgScore += r.acbmtg;
            monthlyTotals[i].ACBM.TR.avgScore += r.tr;
            monthlyTotals[i].GEEBM.totalGEEBM += r.geebm;
            monthlyTotals[i].GEEBM.TQBM += r.tqbm;
            monthlyTotals[i].GEEBM.GOVBM += r.govbm;
            monthlyTotals[i].GEEBM.ACBM += r.acbm;
            monthlyTotals[i].GEEBM.TRA += r.tra;
            monthlyTotals[i].GEEBM.TV.avgScore += r.tv;
            monthlyTotals[i].GEEBM.CP.avgScore += r.cp;
        });

        const monthlySums = [];
        for (let m = startMonth; m <= endMonth; m++) {
            const i = m - 1;
            const perf = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].sum / monthlyTotals[i].count) : 0;
            const TQBM = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].TQBM.totalTQBM / monthlyTotals[i].count) : 0;
            const TQBMTG = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].TQBM.TG.avgScore / monthlyTotals[i].count) : 0;
            const TQBMTE = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].TQBM.TE.avgScore / monthlyTotals[i].count) : 0;
            const TQBMT = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].TQBM.T.avgScore / monthlyTotals[i].count) : 0;
            const GOVBM = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].GOVBM.totalGOVBM / monthlyTotals[i].count) : 0;
            const GOVBMIP = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].GOVBM.IP.avgScore / monthlyTotals[i].count) : 0;
            const GOVBMDD = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].GOVBM.DD.avgScore / monthlyTotals[i].count) : 0;
            const GOVBMPO = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].GOVBM.PO.avgScore / monthlyTotals[i].count) : 0;
            const GOVBMQD = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].GOVBM.QD.avgScore / monthlyTotals[i].count) : 0;
            const GOVBMW = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].GOVBM.W.avgScore / monthlyTotals[i].count) : 0;
            const ACBM = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].ACBM.totalACBM / monthlyTotals[i].count) : 0;
            const ACBMTG = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].ACBM.TG.avgScore / monthlyTotals[i].count) : 0;
            const ACBMTR = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].ACBM.TR.avgScore / monthlyTotals[i].count) : 0;
            const GEEBM = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].GEEBM.totalGEEBM / monthlyTotals[i].count) : 0;
            const GEEBMTRA = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].GEEBM.TRA / monthlyTotals[i].count) : 0;
            const GEEBMTTV = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].GEEBM.TV.avgScore / monthlyTotals[i].count) : 0;
            const GEEBMTCP = monthlyTotals[i].count ? roundNumber(monthlyTotals[i].GEEBM.CP.avgScore / monthlyTotals[i].count) : 0;

            monthlySums.push({
                month: months[i],
                monthNumber: m,
                performance: perf,
                codes: [],
                TQBM: { totalTQBM: TQBM, TG: { avgScore: TQBMTG }, TE: { avgScore: TQBMTE }, T: { avgScore: TQBMT } },
                GOVBM: { totalGOVBM: GOVBM, IP: { avgScore: GOVBMIP }, DD: { avgScore: GOVBMDD }, PO: { avgScore: GOVBMPO }, QD: { avgScore: GOVBMQD }, W: { avgScore: GOVBMW } },
                ACBM: { totalACBM: ACBM, TG: { avgScore: ACBMTG }, TR: { avgScore: ACBMTR } },
                GEEBM: { totalGEEBM: GEEBM, TQBM: roundNumber(TQBM * 0.3), GOVBM: roundNumber(GOVBM * 0.25), ACBM: roundNumber(ACBM * 0.2), TRA: GEEBMTRA, TV: { avgScore: GEEBMTTV }, CP: { avgScore: GEEBMTCP } },
                color: '#ef4444'
            });
        }
        const orgName = school.name;
        const orgLocation = school.location;

        if (school.id === 4 || school.id === 5 || school.id === 7 || school.id === 8 || school.id === 9) { totalMonths = monthlySums };
        const totalOrgMonths = resultsThisRun.filter(month => month.monthNumber >= startMonth && month.monthNumber <= currentMonth);
        const monthlySums2 = [];

        for (let m = startMonth; m <= endMonth; m++) {
            const currentMonthData = totalOrgMonths.find(month => month.monthNumber === m);
            if (!currentMonthData) continue;

            fillWatomsMissingCodes(currentMonthData, formsTG, "tgCodes");
            fillWatomsMissingCodes(currentMonthData, formsTE, "teCodes");
            fillWatomsMissingCodes(currentMonthData, formsT, "tCodes");
            fillWatomsMissingCodes(currentMonthData, formsIP, "ipCodes");
            fillWatomsMissingCodes(currentMonthData, formsDD, "ddCodes");
            fillWatomsMissingCodes(currentMonthData, formsPO, "poCodes");
            fillWatomsMissingCodes(currentMonthData, formsQD, "qdCodes");
            fillWatomsMissingCodes(currentMonthData, formsW, "wCodes");
            fillWatomsMissingCodes(currentMonthData, formsTR, "trCodes");
            fillWatomsMissingCodes(currentMonthData, formsCP, "cpCodes");

            const perf = roundNumber(currentMonthData.performance || 0);
            const TQBM = roundNumber(currentMonthData.tqbm || 0);
            const TQBMTG = roundNumber(currentMonthData.tqbmtg || 0);
            const TQBMTE = roundNumber(currentMonthData.te || 0);
            const TQBMT = roundNumber(currentMonthData.t || 0);
            const GOVBM = roundNumber(currentMonthData.govbm || 0);
            const GOVBMIP = roundNumber(currentMonthData.ip || 0);
            const GOVBMDD = roundNumber(currentMonthData.dd || 0);
            const GOVBMPO = roundNumber(currentMonthData.po || 0);
            const GOVBMQD = roundNumber(currentMonthData.qd || 0);
            const GOVBMW = roundNumber(currentMonthData.w || 0);
            const ACBM = roundNumber(currentMonthData.acbm || 0);
            const ACBMTG = roundNumber(currentMonthData.acbmtg || 0);
            const ACBMTR = roundNumber(currentMonthData.tr || 0);
            const GEEBM = roundNumber(currentMonthData.geebm || 0);
            const GEEBMTRA = roundNumber(currentMonthData.tra || 0);
            const GEEBMTTV = roundNumber(currentMonthData.tv || 0);
            const GEEBMTCP = roundNumber(currentMonthData.cp || 0);

            monthlySums2.push({
                month: currentMonthData.month,
                monthNumber: m,
                performance: perf,
                TQBM: {
                    totalTQBM: TQBM,
                    TG: { avgScore: TQBMTG, codeScores: currentMonthData.tgCodes, scores: currentMonthData.eachTG, no_of_forms: currentMonthData.eachTG.length },
                    TE: { avgScore: TQBMTE, codeScores: currentMonthData.teCodes, scores: currentMonthData.eachTE, no_of_forms: currentMonthData.eachTE.length },
                    T: { avgScore: TQBMT, codeScores: currentMonthData.tCodes, scores: currentMonthData.eachT, no_of_forms: currentMonthData.eachT.length }
                },
                GOVBM: {
                    totalGOVBM: GOVBM,
                    IP: { avgScore: GOVBMIP, codeScores: currentMonthData.ipCodes, scores: currentMonthData.eachIP, no_of_forms: currentMonthData.eachIP.length },
                    DD: { avgScore: GOVBMDD, codeScores: currentMonthData.ddCodes, scores: currentMonthData.eachDD, no_of_forms: currentMonthData.eachDD.length },
                    PO: { avgScore: GOVBMPO, codeScores: currentMonthData.poCodes, scores: currentMonthData.eachPO, no_of_forms: currentMonthData.eachPO.length },
                    QD: { avgScore: GOVBMQD, codeScores: currentMonthData.qdCodes, scores: currentMonthData.eachQD, no_of_forms: currentMonthData.eachQD.length },
                    W: { avgScore: GOVBMW, codeScores: currentMonthData.wCodes, scores: currentMonthData.eachW, no_of_forms: currentMonthData.eachW.length }
                },
                ACBM: {
                    totalACBM: ACBM,
                    TG: { avgScore: ACBMTG, codeScores: currentMonthData.tgCodes, scores: currentMonthData.eachTG, no_of_forms: currentMonthData.eachTG.length },
                    TR: { avgScore: ACBMTR, codeScores: currentMonthData.trCodes, scores: currentMonthData.eachTR, no_of_forms: currentMonthData.eachTR.length }
                },
                GEEBM: {
                    totalGEEBM: GEEBM,
                    TQBM: roundNumber(TQBM * 0.3),
                    GOVBM: roundNumber(GOVBM * 0.25),
                    ACBM: roundNumber(ACBM * 0.2),
                    TRA: GEEBMTRA,
                    TV: { avgScore: GEEBMTTV, codeScores: currentMonthData.croCodes, scores: currentMonthData.eachCRO, no_of_forms: currentMonthData.eachCRO.length },
                    CP: { avgScore: GEEBMTCP, codeScores: currentMonthData.cpCodes, scores: currentMonthData.eachCP, no_of_forms: currentMonthData.eachCP.length }
                },
                color: '#ef4444'
            });
        }

        // Save to result object
        if (school.id === 4 || school.id === 5 || school.id === 7 || school.id === 8 || school.id === 9) {
            totalScores += overAllScore.totalScore;
            TQBM.totalTQBM += overAllScore.totalTQBM;
            TQBM.TG.avgScore += overAllScore.avgTG;
            TQBM.TG.scores.push(...allTGScore);
            TQBM.TE.avgScore += overAllScore.avgTE;
            TQBM.TE.scores.push(...allTEScore);
            TQBM.T.avgScore += overAllScore.avgT;
            TQBM.T.scores.push(...allTScore);
            GOVBM.totalGOVBM += overAllScore.totalGOVBM;
            GOVBM.IP.avgScore += overAllScore.avgIP;
            GOVBM.IP.scores.push(...allIPScore);
            GOVBM.DD.avgScore += overAllScore.avgDD;
            GOVBM.DD.scores.push(...allDDScore);
            GOVBM.PO.avgScore += overAllScore.avgPO;
            GOVBM.PO.scores.push(...allPOScore);
            GOVBM.QD.avgScore += overAllScore.avgQD;
            GOVBM.QD.scores.push(...allQDScore);
            GOVBM.W.avgScore += overAllScore.avgW;
            GOVBM.W.scores.push(...allWScore);
            ACBM.totalACBM += overAllScore.totalACBM;
            ACBM.TG.avgScore += overAllScore.avgTG;
            ACBM.TG.scores.push(...allTGScore);
            ACBM.TR.avgScore += overAllScore.avgTR;
            ACBM.TR.scores.push(...allTRScore);
        }
        results.organizations[school.id] = {
            id: school.id,
            name: orgName,
            location: orgLocation || "",
            managerId: orgManager[0]?.id,
            managerFirstName: orgManager[0]?.first_name,
            managerMiddleName: orgManager[0]?.middle_name,
            managerLastName: orgManager[0]?.last_name,
            no_of_trainees: relatedStudents.length,
            no_of_trainers: relatedTeachers?.length,
            no_of_employees: relatedEmployees?.length,
            overall: overAllScore.totalScore,
            months: monthlySums2
        }
    }
    results.total.overall = totalScores / 5;
    results.total.months = totalMonths;
    results.total.no_of_trainees = dashboard.students.length;
    results.totalCurriculums = dashboard.curriculums.length;
    results.total.no_of_employees = dashboard.employees.length;
    results.total.no_of_trainers = dashboard.teachers.length;

    return results;
};

exports.getWatomsDashboardGeneralInfoData = async () => {
    const generalInfo = await wabysRepository.fetchDashboardGeneralInfoData(2);

    const result = {
        All: {
            organizations: generalInfo.organizations,
            employees: generalInfo.employees,
            managers: [],
            admins: [],
            trainers: [],
        },
    };

    // used to merge all trainers later
    const allTrainersBySubjectMap = new Map();

    for (const vtc of generalInfo.organizations) {
        const relatedEmployees = generalInfo.employees.filter(
            emp => emp.organization_id === vtc.id
        );

        const relatedEmployeeIds = relatedEmployees.map(emp => emp.id);

        const managers = relatedEmployees.filter(emp => emp.role_id === 29);
        const admins = relatedEmployees.filter(emp => emp.role_id === 30);

        const relatedTeachers = generalInfo.teachers.filter(teacher =>
            relatedEmployeeIds.includes(teacher.employee_id)
        );

        // attach subject_id to trainer employees
        const relatedTrainersEmployees = relatedEmployees
            .filter(emp => relatedTeachers.some(t => t.employee_id === emp.id))
            .map(emp => {
                const teacher = relatedTeachers.find(t => t.employee_id === emp.id);
                return {
                    ...emp,
                    subject_id: teacher?.subject_id ?? null,
                };
            });

        // ===== GROUP TRAINERS BY SUBJECT (ARRAY) =====
        const trainersBySubjectMap = new Map();

        for (const trainer of relatedTrainersEmployees) {
            const subjectId = trainer.subject_id;
            const subject = generalInfo.subjects.find(s => s.id === subjectId) || null;

            if (!trainersBySubjectMap.has(subjectId)) {
                trainersBySubjectMap.set(subjectId, {
                    subject,
                    trainers: [],
                });
            }

            trainersBySubjectMap.get(subjectId).trainers.push(trainer);
        }

        const groupedTrainers = Array.from(trainersBySubjectMap.values());

        // store per VTC
        result[vtc.id] = {
            organization: vtc,
            employees: relatedEmployees,
            managers,
            admins,
            trainers: groupedTrainers,
        };

        // ===== ACCUMULATE "ALL" =====
        result.All.managers.push(...managers);
        result.All.admins.push(...admins);

        for (const group of groupedTrainers) {
            const subjectId = group.subject?.id ?? null;

            if (!allTrainersBySubjectMap.has(subjectId)) {
                allTrainersBySubjectMap.set(subjectId, {
                    subject: group.subject,
                    trainers: [],
                });
            }

            allTrainersBySubjectMap.get(subjectId).trainers.push(
                ...group.trainers
            );
        }
    }

    // finalize All.trainers as ARRAY grouped by subject
    result.All.trainers = Array.from(allTrainersBySubjectMap.values());
    return result;
};

exports.getWatomsTrainersRegistrationsData = async () => {
    const registrations = await wabysRepository.fetchWatomsTrainersRegistrationsData();

    return registrations;
};

exports.getWatomsTrainingEnvironmentPerformanceReportData = async (vtcs, workshops) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const report = await watomsRepository.fetchTrainingEnvironmentPerformanceReportData(
        year,
        month,
        vtcs,
        workshops
    );

    const fieldsWithQuestionIds = (report.trainingEnvironmentForm?.fields || []).map((field) => {
        const questionIds = [];

        for (const subField of field.sub_fields || []) {
            for (const question of subField.questions || []) {
                questionIds.push(question.id);
            }
        }

        return {
            fieldId: field.id,
            fieldName: field.ar_name,
            weight: Number(field.weight) || 0, // expect 0..100
            questionIds,
        };
    });

    const reports = report.trainingEnvironmentReports || [];
    if (reports.length === 0) {
        return {
            ...report,
            teTotalScore: 0,
            fieldScores: fieldsWithQuestionIds.map((f) => ({
                fieldId: f.fieldId,
                fieldName: f.fieldName,
                score: 0,
            })),
        };
    }

    let teScoresSum = 0;
    const fieldSumAcrossReports = new Array(fieldsWithQuestionIds.length).fill(0);

    for (const singleReport of reports) {
        const results = singleReport.results || [];

        let reportWeightedTotal = 0;

        fieldsWithQuestionIds.forEach((fieldInfo, idx) => {
            const fieldResults = results.filter((res) =>
                fieldInfo.questionIds.includes(res.question_id)
            );

            let fieldScoreSum = 0;
            let validCount = 0;

            for (const r of fieldResults) {
                const max = r?.questionResult?.max_score;
                if (!max || max <= 0) continue;

                fieldScoreSum += (r.score / max) * 100;
                validCount++;
            }

            const fieldAvg = validCount ? fieldScoreSum / validCount : 0;

            fieldSumAcrossReports[idx] += fieldAvg;

            reportWeightedTotal += fieldAvg * (fieldInfo.weight / 100);
        });

        teScoresSum += reportWeightedTotal;
    }

    const teTotalScore = teScoresSum / reports.length;

    const fieldScores = fieldsWithQuestionIds.map((f, idx) => ({
        fieldId: f.fieldId,
        fieldName: f.fieldName,
        score: fieldSumAcrossReports[idx] / reports.length,
    }));

    return {
        ...report,
        teTotalScore,
        fieldScores,
    };
};

exports.getWatomsBFPerformanceReportData = async (vtcs) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const report = await watomsRepository.fetchBFPerformanceReportData(
        year,
        month,
        vtcs
    );

    const fieldsWithQuestionIds = (report.bfForm?.fields || []).map((field) => {
        const questionIds = [];

        for (const subField of field.sub_fields || []) {
            for (const question of subField.questions || []) {
                questionIds.push(question.id);
            }
        }

        return {
            fieldId: field.id,
            fieldName: field.ar_name,
            weight: Number(field.weight) || 0,
            questionIds,
        };
    });

    const reports = report.bfReports || [];
    if (reports.length === 0) {
        return {
            ...report,
            teTotalScore: 0,
            fieldScores: fieldsWithQuestionIds.map((f) => ({
                fieldId: f.fieldId,
                fieldName: f.fieldName,
                score: 0,
            })),
        };
    }

    let teScoresSum = 0;
    const fieldSumAcrossReports = new Array(fieldsWithQuestionIds.length).fill(0);

    for (const singleReport of reports) {
        const results = singleReport.results || [];

        let reportWeightedTotal = 0;

        fieldsWithQuestionIds.forEach((fieldInfo, idx) => {
            const fieldResults = results.filter((res) =>
                fieldInfo.questionIds.includes(res.question_id)
            );

            let fieldScoreSum = 0;
            let validCount = 0;

            for (const r of fieldResults) {
                const max = r?.questionResult?.max_score;
                if (!max || max <= 0) continue;

                fieldScoreSum += (r.score / max) * 100;
                validCount++;
            }

            const fieldAvg = validCount ? fieldScoreSum / validCount : 0;

            fieldSumAcrossReports[idx] += fieldAvg;

            reportWeightedTotal += fieldAvg * (fieldInfo.weight / 100);
        });

        teScoresSum += reportWeightedTotal;
    }

    // average weighted totals across reports
    const teTotalScore = teScoresSum / reports.length;

    const fieldScores = fieldsWithQuestionIds.map((f, idx) => ({
        fieldId: f.fieldId,
        fieldName: f.fieldName,
        score: fieldSumAcrossReports[idx] / reports.length,
    }));

    return {
        ...report,
        teTotalScore,
        fieldScores,
    };
};

exports.getWatomsEmployees = async () => {
    const employees = await wabysRepository.fetchSystemRelatedEmployees(2);

    return employees;
};

exports.getWatomsOrgsCurriculumsData = async () => {
    const curriculums = await wabysRepository.fetchAllCurriculumsPerSystemData(2);

    const result = { total: [] };
    const seenCurriculums = new Set();

    for (const curriculum of curriculums) {
        if (!seenCurriculums.has(curriculum.id)) {
            seenCurriculums.add(curriculum.id);
            result.total.push(curriculum);
        }

        const specializations = curriculum?.subject?.specializations || [];

        for (const ss of specializations) {
            const organizations = ss?.specialization?.organizations || [];

            for (const org of organizations) {
                const orgId = org.id;
                if (!orgId) continue;

                if (!result[orgId]) {
                    result[orgId] = [];
                }

                result[orgId].push(curriculum);
            }
        }
    }

    return result;
};

exports.getWatomsSubjectsData = async () => {
    const subjects = await wabysRepository.fetchRelatedSubjectsPerSystemData(2);

    return subjects;
};

exports.postWatomsTrainersRegistrationForm = async (data) => {

    const form = await watomsRepository.insertTrainersRegistrationForm(data);

    return form;
};

exports.getWatomsCoursesDetailedData = async () => {
    const courses = await wabysRepository.fetchWatomsCoursesDetailsData();

    return courses;
};

exports.getWatomsCurriculumsOrgsData = async () => {
    const curriculums = await wabysRepository.fetchAllCurriculumsPerSystemData(2);

    const byCurriculum = new Map();

    const toPlain = (x) =>
        x?.get ? x.get({ plain: true }) : (x?.toJSON ? x.toJSON() : x);

    const stripThrough = (obj) => {
        if (!obj || typeof obj !== "object") return obj;
        const { through, ...rest } = obj; // remove circular reference source
        return rest;
    };

    for (const curriculumInstance of curriculums) {
        const curriculum = toPlain(curriculumInstance);
        const curriculumId = curriculum?.id;
        if (!curriculumId) continue;

        if (!byCurriculum.has(curriculumId)) {
            // also strip through in the curriculum tree if needed
            byCurriculum.set(curriculumId, {
                curriculum,
                orgMap: new Map(),
            });
        }

        const entry = byCurriculum.get(curriculumId);

        const specializations = curriculum?.subject?.specializations || [];
        for (const ss of specializations) {
            const organizations = ss?.specialization?.organizations || [];
            for (const orgRaw of organizations) {
                const org = stripThrough(orgRaw);
                const orgId = org?.id;
                if (!orgId) continue;

                // store org without through (and you can also pick only needed fields)
                if (!entry.orgMap.has(orgId)) {
                    entry.orgMap.set(orgId, org);
                }
            }
        }
    }

    // Return array: curriculum + organizations[]
    return Array.from(byCurriculum.values()).map(({ curriculum, orgMap }) => ({
        ...curriculum,
        organizations: Array.from(orgMap.values()),
    }));
};

exports.getSpecializationsData = async () => {
    return await wabysRepository.fetchSystemRelatedSpecializations(2);
};

exports.getClassRoomsData = async () => {
    return await wabysRepository.fetchSystemRelatedClassRooms(2);
};

exports.getSystemSurveyData = async () => {
    return await wabysRepository.fetchSystemSurvey();
};

exports.insertSystemSurveyData = async (data) => {
    return await wabysRepository.insertSystemSurvey(data);
};

exports.getTrainersData = async () => {
    return await wabysRepository.fetchSystemRelatedMentors(2);
};