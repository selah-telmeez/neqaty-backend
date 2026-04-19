exports.calculateFormScore = (forms) => {
    const result = forms.map(form => {
        const results = Array.isArray(form.results) ? form.results : [];

        /* ===== Overall average ===== */
        const average =
            results.length === 0
                ? 0
                : results.reduce((sum, r) => {
                    return sum + (r.score / r.question.max_score);
                }, 0) / results.length;

        /* ===== Average per field (ar_name) ===== */
        const fieldMap = {};

        results.forEach(r => {
            const fieldName = r.question?.sub_field?.field?.ar_name;
            if (!fieldName) return;

            if (!fieldMap[fieldName]) {
                fieldMap[fieldName] = { total: 0, sum: 0 };
            }

            fieldMap[fieldName].total += 1;
            fieldMap[fieldName].sum += (r.score / r.question.max_score);
        });

        const fieldScores = Object.keys(fieldMap).map(field_name => ({
            field_name,
            score:
                fieldMap[field_name].total === 0
                    ? 0
                    : (fieldMap[field_name].sum / fieldMap[field_name].total) * 100
        }));

        return {
            id: form.id,
            user_id: form.Assessee_id,
            note: form.note,
            comment: form.comment,
            createdAt: form.createdAt,
            score: average * 100,
            field_scores: fieldScores
        };
    });

    return result;
};

exports.calculateInterviewTestScore = (evaluations) => {
    const result = evaluations.map(evaluation => {

        const average =
            (
                evaluation.first_result +
                evaluation.second_result +
                evaluation.third_result +
                evaluation.fourth_result +
                evaluation.fifth_result +
                evaluation.sixth_result
            ) / 6;

        return {
            id: evaluation.id,
            user_id: evaluation.employee.user_id,
            createdAt: evaluation.createdAt,
            score: average,
            field_scores: [
                {
                    field_name: "تخطيط وتصميم التدريس القائم على الجدارات",
                    score:evaluation.first_result
                },
                {
                    field_name: "إدارة الصف ومشاركة الطلاب",
                    score:evaluation.second_result
                },
                {
                    field_name: "اختيار وتصميم مصادر التعلم",
                    score:evaluation.third_result
                },
                {
                    field_name: "توظيف التكنولوجيا في التعليم",
                    score:evaluation.fourth_result
                },
                {
                    field_name: "أفضل استخدام لأساليب التدريس",
                    score:evaluation.fifth_result
                },
                {
                    field_name: "تقنيات التقييم والتقويم التربوي",
                    score:evaluation.sixth_result
                }
            ],
        };
    });

    return result;
}

exports.calculateMcqExamsScore = (exams) => {
    const result = exams.map(exam => {
        const results = Array.isArray(exam.answers) ? exam.answers : [];

        /* ===== Overall average ===== */
        const average =
            results.length === 0
                ? 0
                : results.reduce((sum, r) => {
                    return sum + (r.choice?.status ? 1 : 0);
                }, 0) / results.length;

        /* ===== Average per field_id ===== */
        const fieldMap = {};

        results.forEach(r => {
            const fieldId = r.question?.field_id;
            if (!fieldId) return;

            if (!fieldMap[fieldId]) {
                fieldMap[fieldId] = { total: 0, correct: 0 };
            }

            fieldMap[fieldId].total += 1;
            if (r.choice?.status) {
                fieldMap[fieldId].correct += 1;
            }
        });

        const fieldScores = Object.keys(fieldMap).map(field_id => ({
            field_id,
            score:
                fieldMap[field_id].total === 0
                    ? 0
                    : (fieldMap[field_id].correct / fieldMap[field_id].total) * 100
        }));

        return {
            id: exam.id,
            user_id: exam.user_id,
            createdAt: exam.createdAt,
            score: average * 100,
            field_scores: fieldScores
        };
    });

    return result;
};