const months = ['يناير', 'فبراير', 'مارس', 'ابريل', 'مايو', 'يونيو', 'يوليو', 'اغسطس', 'سبتمبر', 'اكتوبر', 'نوفمبر', 'ديسمبر'];

const avg = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    let sum = 0, n = 0;
    for (const it of arr) {
        const v = Number(it?.average_score);
        if (Number.isFinite(v)) { sum += v; n++; }    // only count valid scores
    }
    return n ? sum / n : 0;
};

exports.calculateWatomsTotalScore = (tg, te, t, ip, dd, po, qd, w, tr, cp, cro, tra, tv, start, end) => {
    const filteredTG = tg.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredTE = te.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredT = t.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredIP = ip.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredDD = dd.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredPO = po.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredQD = qd.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredW = w.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredTR = tr.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredCP = cp.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const filteredCRO = cro.filter(test => test.formDate !== null && test.formDate >= start && test.formDate < end);
    const tvFormsScores = tv.map(t => { return (t.first_result + t.second_result + t.third_result + t.fourth_result + t.fifth_result + t.sixth_result) / 6 })
    const tvAvgScore = tvFormsScores.reduce((a, b) => a + b, 0) / tvFormsScores.length;
    
    const tgScore = avg(filteredTG);
    const teScore = avg(filteredTE);
    const tScore = avg(filteredT);
    const ipScore = avg(filteredIP);
    const ddScore = avg(filteredDD);
    const poScore = avg(filteredPO);
    const qdScore = avg(filteredQD);
    const wScore = avg(filteredW);
    const trScore = avg(filteredTR);
    const croScore = avg(filteredCRO);
    const tvScore = (tvAvgScore + croScore) / 2;
    const cpScore = avg(filteredCP);
    
    const tqbm = tgScore && tScore ? (tgScore * 40) + (teScore * 35) + (tScore * 25) : (teScore * 100);
    const govbm = (ipScore * 15) + (ddScore * 30) + (poScore * 20) + (qdScore * 20) + (wScore * 15);
    const acbm = (trScore * 40) + (tgScore * 60);
    const geebm = acbm === 0 ? (tqbm * 0.3) + (govbm * 0.45) + (tra * 0.1) + (tvScore * 0.05) + (cpScore * 0.1) : (tqbm * 0.3) + (govbm * 0.25) + (acbm * 0.2) + (tra * 0.1) + (tvScore * 0.05) + (cpScore * 0.1);

    return {
        avgTG: tgScore,
        avgTE: teScore,
        avgT: tScore,
        avgIP: ipScore,
        avgDD: ddScore,
        avgPO: poScore,
        avgQD: qdScore,
        avgW: wScore,
        avgTR: trScore,
        avgTV: tvScore,
        avgCP: cpScore,
        totalTQBM: tqbm,
        totalGOVBM: govbm,
        totalACBM: acbm,
        totalGEEBM: geebm,
        totalScore: geebm
    }
}

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

function filterTVPerMonth(year, month, data) {
    const filteredData = data.filter(item => {
        const d = new Date(item.createdAt);
        return d.getFullYear() === year && (d.getMonth()) === (month - 1);
    });

    if (filteredData?.length !== 0) {
        const tvFormsScores = filteredData.map(t => { return (t.first_result + t.second_result + t.third_result + t.fourth_result + t.fifth_result + t.sixth_result) / 6 })
        const tvAvgScore = tvFormsScores.reduce((a, b) => a + b, 0) / tvFormsScores.length;
        return tvAvgScore;
    }

    return 0;
}

exports.calculateWatomsEachMonthScore = (year, month, tg, te, t, ip, dd, po, qd, w, tr, cro, tra, tv, cp) => {
    const filteredTG = filterPerMonth(year, month, tg);
    const filteredTGEach = filterEachPerMonth(year, month, tg);
    const filteredTGCodes = filterCodePerMonth(year, month, tg);
    const filteredTE = filterPerMonth(year, month, te);
    const filteredTEEach = filterEachPerMonth(year, month, te);
    const filteredTECodes = filterCodePerMonth(year, month, te);
    const filteredT = filterPerMonth(year, month, t);
    const filteredTEach = filterEachPerMonth(year, month, t);
    const filteredTCodes = filterCodePerMonth(year, month, t);
    const filteredIP = filterPerMonth(year, month, ip);
    const filteredIPEach = filterEachPerMonth(year, month, ip);
    const filteredIPCodes = filterCodePerMonth(year, month, ip);
    const filteredDD = filterPerMonth(year, month, dd);
    const filteredDDEach = filterEachPerMonth(year, month, dd);
    const filteredDDCodes = filterCodePerMonth(year, month, dd);
    const filteredPO = filterPerMonth(year, month, po);
    const filteredPOEach = filterEachPerMonth(year, month, po);
    const filteredPOCodes = filterCodePerMonth(year, month, po);
    const filteredQD = filterPerMonth(year, month, qd);
    const filteredQDEach = filterEachPerMonth(year, month, qd);
    const filteredQDCodes = filterCodePerMonth(year, month, qd);
    const filteredW = filterPerMonth(year, month, w);
    const filteredWEach = filterEachPerMonth(year, month, w);
    const filteredWCodes = filterCodePerMonth(year, month, w);
    const filteredTR = filterPerMonth(year, month, tr);
    const filteredTREach = filterEachPerMonth(year, month, tr);
    const filteredTRCodes = filterCodePerMonth(year, month, tr);
    const filteredCRO = filterPerMonth(year, month, cro);
    const filteredCROEach = filterEachPerMonth(year, month, cro);
    const filteredCROCodes = filterCodePerMonth(year, month, cro);
    const filteredTV = filterTVPerMonth(year, month, tv);
    const filteredCP = filterPerMonth(year, month, cp);
    const filteredCPEach = filterEachPerMonth(year, month, cp);
    const filteredCPCodes = filterCodePerMonth(year, month, cp);
    const filteredTra = tra.filter(s => {
        if (!s.createdAt) return false;
        const d = new Date(s.createdAt);
        return d.getFullYear() === year && d.getMonth() === month - 1;
    });
    const attendedCount = filteredTra.filter(s => s.status === 'attend').length;
    const allStudentsAttendance = tra.length > 0 ? attendedCount / tra.length : 0;
    const tqbm = filteredTG && filteredT ? (filteredTG * 40) + (filteredTE * 35) + (filteredT * 25) : (filteredTE * 100);
    const govbm = (filteredIP * 15) + (filteredDD * 30) + (filteredPO * 20) + (filteredQD * 20) + (filteredW * 15);
    const acbm = (filteredTR * 40) + (filteredTG * 60);
    const geebm = acbm === 0 ? (tqbm * 0.3) + (govbm * 0.45) + (allStudentsAttendance * 10) + (((filteredTV + (filteredCRO * 100)) / 2) * 0.05) + (filteredCP * 0.1) : (tqbm * 0.3) + (govbm * 0.25) + (acbm * 0.2) + (allStudentsAttendance * 0.1) + (filteredTV * 0.05) + (filteredCP * 0.1);
    const totalScore = geebm;
    return {
        month: months[month - 1],
        monthNumber: (month),
        performance: totalScore,
        tqbm, govbm, acbm, geebm,
        tqbmtg: (filteredTG * 100), te: (filteredTE * 100), t: (filteredT * 100),
        ip: (filteredIP * 100), dd: (filteredDD * 100), po: (filteredPO * 100), qd: (filteredQD * 100), w: (filteredW * 100),
        acbmtg: (filteredTG * 100), tr: (filteredTR * 100),
        tra: (allStudentsAttendance), tv: ((filteredTV + (filteredCRO * 100)) / 2), cp: (filteredCP * 100),
        tgCodes: filteredTGCodes, teCodes: filteredTECodes, tCodes: filteredTCodes,
        ipCodes: filteredIPCodes, ddCodes: filteredDDCodes, poCodes: filteredPOCodes, qdCodes: filteredQDCodes, wCodes: filteredWCodes,
        trCodes: filteredTRCodes,
        cpCodes: filteredCPCodes, croCodes: filteredCROCodes,
        eachTG: filteredTGEach, eachTE: filteredTEEach, eachT: filteredTEach,
        eachIP: filteredIPEach, eachDD: filteredDDEach, eachPO: filteredPOEach, eachQD: filteredQDEach, eachW: filteredWEach,
        eachTR: filteredTREach,
        eachCP: filteredCPEach, eachCRO: filteredCROEach
    };
}

exports.fillWatomsMissingCodes = (currentMonthData, formsArray, codeKey) => {
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