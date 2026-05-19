const avg = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    let sum = 0, n = 0;
    for (const it of arr) {
        const v = Number(it?.average_score);
        if (Number.isFinite(v)) { sum += v; n++; }    // only count valid scores
    }
    return n ? sum / n : 0;
};

function filterPerMonth(year, month, data) {
    const filteredData = data.filter(item => {
        const d = new Date(item.formDate);
        return d.getFullYear() === year && (d.getMonth()) === (month - 1);
    });
    if (filteredData.some(obj => 'offender_id' in obj)) {
        return filteredData;
    } else if (filteredData?.length !== 0) {
        return avg(filteredData);
    }

    return [];
}

function filterEachPerMonth(year, month, data) {
    const filteredData = data.filter(item => {
        const d = new Date(item.formDate);
        return d.getFullYear() === year && (d.getMonth()) === (month - 1);
    });

    if (filteredData?.length !== 0) {
        return filteredData;
    }

    return [];
};

const avgByCode = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return [];

    const groups = {};

    for (const item of arr) {
        const code = item?.code;
        const name = item?.name;
        const score = Number(item?.average_score);

        if (!code || !Number.isFinite(score)) continue;

        if (!groups[code]) {
            groups[code] = { sum: 0, count: 0, name };
        }

        groups[code].sum += score;
        groups[code].count += 1;
    }

    return Object.entries(groups).map(([code, { sum, count, name }]) => ({
        code,
        name,
        average_score: count ? sum / count : 0
    }));
};

function filterCodePerMonth(year, month, data) {
    const filteredData = data.filter(item => {
        const d = new Date(item.formDate);
        return d.getFullYear() === year && (d.getMonth()) === (month - 1);
    });

    if (filteredData?.length !== 0) {
        return avgByCode(filteredData);
    }

    return [];
}

function calculateTaskAverage(items) {
    let count = 0;
    let total = 0;

    for (const item of items) {
        const values = [
            item.manager_status,
            item.reviewer_status,
            item.manager_quality,
            item.reviewer_quality,
            item.manager_speed,
            item.reviewer_speed
        ];

        // Skip invalid rows safely
        if (values.some(v => typeof v !== "number")) continue;

        let status = 0;
        let quality = 0;
        let speed = 0;
        status += (item.manager_status + item.reviewer_status) / 2;
        quality += (item.manager_quality + item.reviewer_quality) / 2;
        speed += (item.manager_speed + item.reviewer_speed) / 2;
        total += (status + quality + speed) / 3

        count += 1; // manager + reviewer
    }

    return count === 0 ? null : total / count;
}

exports.calculateWisdomMonthlyScores = (year, month, W, WCP, EDU, C, T, FT, DO, PRO, FO, SU, tasks, STB, STD) => {
    const months = ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'];
    const filteredW = filterPerMonth(year, month, W);
    const filteredWEach = filterEachPerMonth(year, month, W);
    const filteredWCodes = filterCodePerMonth(year, month, W);
    const filteredWCP = filterPerMonth(year, month, WCP);
    const filteredWCPEach = filterEachPerMonth(year, month, WCP);
    const filteredWCPCodes = filterCodePerMonth(year, month, WCP);
    const filteredTasks = tasks.filter(task => {
        if (!task.start_date) return false;

        const d = new Date(task.start_date);

        return (
            d.getUTCFullYear() === year &&
            d.getUTCMonth() + 1 === month
        );
    });
    const tasksAvg = filteredTasks.length !== 0 ? calculateTaskAverage(filteredTasks) : 0;
    const filteredEDU = filterPerMonth(year, month, EDU);
    const filteredEDUEach = filterEachPerMonth(year, month, EDU);
    const filteredEDUCodes = filterCodePerMonth(year, month, EDU);
    const filteredC = filterPerMonth(year, month, C);
    const filteredCEach = filterEachPerMonth(year, month, C);
    const filteredCCodes = filterCodePerMonth(year, month, C);
    const filteredT = filterPerMonth(year, month, T);
    const filteredTEach = filterEachPerMonth(year, month, T);
    const filteredTCodes = filterCodePerMonth(year, month, T);
    const filteredDO = filterPerMonth(year, month, DO);
    const filteredDOEach = filterEachPerMonth(year, month, DO);
    const filteredDOCodes = filterCodePerMonth(year, month, DO);
    const filteredPRO = filterPerMonth(year, month, PRO);
    const filteredPROEach = filterEachPerMonth(year, month, PRO);
    const filteredPROCodes = filterCodePerMonth(year, month, PRO);
    const filteredFO = filterPerMonth(year, month, FO);
    const filteredFOEach = filterEachPerMonth(year, month, FO);
    const filteredFOCodes = filterCodePerMonth(year, month, FO);
    const filteredSU = filterPerMonth(year, month, SU);
    const filteredSUEach = filterEachPerMonth(year, month, SU);
    const filteredSUCodes = filterCodePerMonth(year, month, SU);
    const changedateSTB = STB.map(({ behavior_date, ...rest }) => ({ ...rest, formDate: behavior_date }));
    const filteringSTB = filterPerMonth(year, month, changedateSTB);
    const filteredSTB = (filteringSTB.length !== 0 && STD.lenght !== 0) ? 100 - ((filteringSTB.length / STD.length) * 100) : 100;
    const filteredFT = filterPerMonth(year, month, FT);
    const filteredFTEach = filterEachPerMonth(year, month, FT);
    const filteredFTCodes = filterCodePerMonth(year, month, FT);

    const eebm = (filteredW * 40) + (tasksAvg * 0.4) + (filteredWCP * 20);
    const epbm = (filteredEDU * 33) + (filteredC * 33) + (filteredT * 33);
    const odbm = (filteredDO * 25) + (filteredSTB * 0.25) + (0) + (0);
    const apbm = (filteredPRO * 33) + (filteredFO * 33) + (filteredSU * 33);
    const tqbm = (filteredFT * 33) + (0) + (0);
    const geebm = (eebm * 0.2) + (epbm * 0.2) + (odbm * 0.2) + (apbm * 0.2) + (tqbm * 0.2);
    const totalScore = geebm;

    return {
        month: months[month - 1],
        monthNumber: (month),
        performance: totalScore,
        eebm, epbm, odbm, apbm, tqbm, geebm,
        W: (filteredW * 100), WCP: (filteredWCP * 100), TMS: (tasksAvg),
        EDU: (filteredEDU * 100), C: (filteredC * 100), T: (filteredT * 100),
        DO: (filteredDO * 100), STB: (filteredSTB),
        FT: (filteredFT * 100),
        PRO: (filteredPRO * 100), FO: (filteredFO * 100), SU: (filteredSU * 100),
        wCodes: filteredWCodes, wcpCodes: filteredWCPCodes,
        eduCodes: filteredEDUCodes, cCodes: filteredCCodes, tCodes: filteredTCodes,
        doCodes: filteredDOCodes,
        ftCodes: filteredFTCodes,
        proCodes: filteredPROCodes, foCodes: filteredFOCodes, suCodes: filteredSUCodes,
        eachW: filteredWEach, eachWCP: filteredWCPEach,
        eachEDU: filteredEDUEach, eachC: filteredCEach, eachT: filteredTEach,
        eachDO: filteredDOEach,
        eachFT: filteredFTEach,
        eachPRO: filteredPROEach, eachFO: filteredFOEach, eachSU: filteredSUEach,
    };
}

exports.calculateWisdomTotalScore = (W, WCP, EDU, C, T, DO, FT, TMS, STB, STD, PRO, FO, SU, start, end) => {
    const filteredW = W.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredWCP = WCP.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredTMS = TMS.filter(test => test.start_date !== null && test.start_date >= start && test.start_date < end);
    const filteredEDU = EDU.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredC = C.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredT = T.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredDO = DO.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredFT = FT.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filtereSTB = STB.filter(test => test.behavior_date !== null && test.behavior_date >= start && test.behavior_date < end);
    const filteredPRO = PRO.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredFO = FO.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredSU = SU.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    
    const wScore = avg(filteredW);
    const tmsScore = filteredTMS.length !== 0 ? calculateTaskAverage(filteredTMS) : 0;
    const wcpScore = avg(filteredWCP);
    const eduScore = avg(filteredEDU);
    const cScore = avg(filteredC);
    const tScore = avg(filteredT);
    const doScore = avg(filteredDO);
    const stbScore = (filtereSTB.length !== 0 && STD.lenght !== 0) ? 100 - ((filtereSTB.length / STD.length) * 100) : 100;
    const ftScore = avg(filteredFT);
    const proScore = avg(filteredPRO);
    const foScore = avg(filteredFO);
    const suScore = avg(filteredSU);
    
    const eebm = (wScore * 40) + (tmsScore * 0.4) + (wcpScore * 20);
    const epbm = (eduScore * 33) + (cScore * 33) + (tScore * 33);
    const odbm = (doScore * 25) + (stbScore * 0.25) + (0) + (0);
    const apbm = (proScore * 33) + (foScore * 33) + (suScore * 33);
    const tqbm = (ftScore) + (0) + (0);
    const geebm = (eebm * 0.2) + (epbm * 0.2) + (odbm * 0.2) + (apbm * 0.2) + (tqbm * 0.2);
    return {
        avgW: wScore,
        avgWCP: wcpScore,
        avgTMS: tmsScore,
        avgEDU: eduScore,
        avgC: cScore,
        avgT: tScore,
        avgDO: doScore,
        avgSTB: stbScore,
        avgFT: ftScore,
        avgPRO: proScore,
        avgFO: foScore,
        avgSU: suScore,
        totalEEBM: eebm,
        totalEPBM: epbm,
        totalODBM: odbm,
        totalAPBM: apbm,
        totalTQBM: tqbm,
        totalScore: geebm
    }
}

exports.fillMissingFormCodes = (currentMonthData, formsArray, codeKey) => {
    const allCodes = new Set((currentMonthData[codeKey] || []).map(item => item.code));
    const missingForms = formsArray
        .filter(item => !allCodes.has(item.code))
        .map(item => ({
            code: item.code,
            name: item.ar_name,
            average_score: 0
        }));

    currentMonthData[codeKey].push(...missingForms);
}