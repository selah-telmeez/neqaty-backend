const db = require('../db/models');
const { Op } = require("sequelize");
const { hashPassword } = require('../utils/hashPassword');
const validator = require('validator');
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

exports.fetchAllExam = async (req, res) => {
    try {
        const exams = await db.Exam.findAll();

        return res.status(200).json({
            status: "success",
            message: "exams got fetched successfully",
            exams
        });
    } catch (error) {
        console.error('Error fetching rating scale questions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.fetchExam = async (req, res) => {
    try {
        const { id } = req.params;

        const exam = await db.RatingScaleQuestion.findAll({
            where: { exam_id: id }
        })

        return res.status(200).json({
            status: "success",
            message: "exam got fetched successfully",
            exam
        });
    } catch (error) {
        console.error('Error fetching rating scale questions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.fetchMCQExam = async (req, res) => {
    try {
        const { id } = req.params;

        const exam = await db.McqQuestion.findAll({
            include: [
                {
                    model: db.McqChoice,
                    as: "choices",
                    required: true,
                    attributes: ["id", "name", "status"],
                },
            ],
            where: { exam_id: id }
        })

        return res.status(200).json({
            status: "success",
            message: "exam got fetched successfully",
            exam
        });
    } catch (error) {
        console.error('Error fetching rating scale questions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.fetchForcedChoiceExam = async (req, res) => {
    try {
        const { id } = req.params;

        const exam = await db.ForcedChoiceQuestion.findAll({
            include: [
                {
                    model: db.ForcedChoiceChoice,
                    as: "choices",
                    required: true,
                    attributes: ["id", "name", "answer"],
                },
            ],
            where: { exam_id: id }
        })

        return res.status(200).json({
            status: "success",
            message: "exam got fetched successfully",
            exam
        });
    } catch (error) {
        console.error('Error fetching rating scale questions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.fetchEvaluationExam = async (req, res) => {
    try {
        const { id } = req.params;

        const exam = await db.EvaluationQuestion.findAll({
            where: { exam_id: id }
        })

        return res.status(200).json({
            status: "success",
            message: "exam got fetched successfully",
            exam
        });
    } catch (error) {
        console.error('Error fetching rating scale questions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.fetchCandidate = async (req, res) => {
    try {
        const { id } = req.params;

        const candidate = await db.PeCandidate.findOne({
            where: { candidate_id: id }
        })

        return res.status(200).json({
            status: "success",
            message: "candidate got fetched successfully",
            candidate
        });
    } catch (error) {
        console.error('Error fetching rating scale questions:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

exports.submitExamAnswers = async (req, res) => {
    try {
        const { candidate_id, exam_id, allAnswers } = req.body;

        // Validate input
        if (!candidate_id || !exam_id || !Array.isArray(allAnswers)) {
            return res.status(400).json({
                status: 'fail',
                message: 'candidate_id, exam_id and allAnswers array are required'
            });
        }

        // Step 1: Create a record in candidates_rate_scale_exams
        const examRecord = await db.CandidatesRateScaleExam.create({
            candidate_id,
            exam_id
        });

        // Step 2: Create all answers in candidates_rate_scale_answers
        const answersData = allAnswers.map((item) => ({
            score: item.answer,
            exam_id: examRecord.id,
            question_id: item.question_id,
        }));

        await db.CandidatesRateScaleAnswer.bulkCreate(answersData);

        return res.status(201).json({
            status: 'success',
            message: 'Exam answers submitted successfully',
            examRecordId: examRecord.id,
        });
    } catch (error) {
        console.error('Error submitting exam answers:', error);
        return res.status(500).json({
            status: 'fail',
            message: 'Internal server error',
        });
    }
};

exports.submitMCQExamAnswers = async (req, res) => {
    try {
        const { candidate_id, exam_id, allAnswers } = req.body;

        // Validate input
        if (!candidate_id || !exam_id || !Array.isArray(allAnswers)) {
            return res.status(400).json({
                status: 'fail',
                message: 'candidate_id, exam_id and allAnswers array are required'
            });
        }

        // Step 1: Create a record in candidates_rate_scale_exams
        const examRecord = await db.CandidatesMcqExam.create({
            candidate_id,
            exam_id
        });

        // Step 2: Create all answers in candidates_rate_scale_answers
        const answersData = allAnswers.map((item) => ({
            choice_id: item.answer,
            exam_id: examRecord.id,
            question_id: item.question_id,
        }));

        await db.CandidatesMcqAnswer.bulkCreate(answersData);

        return res.status(201).json({
            status: 'success',
            message: 'Exam answers submitted successfully',
            examRecordId: examRecord.id,
        });
    } catch (error) {
        console.error('Error submitting exam answers:', error);
        return res.status(500).json({
            status: 'fail',
            message: 'Internal server error',
        });
    }
};

exports.submitEvaluationExamAnswers = async (req, res) => {
    try {
        const { candidate_id, exam_id, allAnswers } = req.body;

        // Validate input
        if (!candidate_id || !exam_id || !Array.isArray(allAnswers)) {
            return res.status(400).json({
                status: 'fail',
                message: 'candidate_id, exam_id and allAnswers array are required'
            });
        }

        // Step 1: Create a record in candidates_rate_scale_exams
        const examRecord = await db.CandidatesEvaluationExam.create({
            candidate_id,
            exam_id
        });

        // Step 2: Create all answers in candidates_rate_scale_answers
        const answersData = allAnswers.map((item) => ({
            score: item.answer,
            exam_id: examRecord.id,
            question_id: item.question_id,
            comment: item.comment
        }));

        await db.CandidatesEvaluationAnswer.bulkCreate(answersData);

        return res.status(201).json({
            status: 'success',
            message: 'Exam answers submitted successfully',
            examRecordId: examRecord.id,
        });
    } catch (error) {
        console.error('Error submitting exam answers:', error);
        return res.status(500).json({
            status: 'fail',
            message: 'Internal server error',
        });
    }
};

exports.submitForcedChoiceExamAnswers = async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { candidate_id, exam_id, allAnswers } = req.body;

        // Validate input
        if (!candidate_id || !exam_id || !Array.isArray(allAnswers)) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'fail',
                message: 'candidate_id, exam_id and allAnswers array are required',
            });
        }

        const examRecord = await db.CandidatesForcedChoiceExam.create(
            { candidate_id, exam_id },
            { transaction }
        );

        const answersData = allAnswers.map((item) => ({
            choice_id: item.answer,
            exam_id: examRecord.id,
            question_id: item.question_id,
        }));

        await db.CandidatesForcedChoiceAnswer.bulkCreate(answersData, { transaction });

        await transaction.commit();

        return res.status(201).json({
            status: 'success',
            message: 'Forced-choice exam answers submitted successfully',
            examRecordId: examRecord.id,
        });
    } catch (error) {
        console.error('Error submitting forced-choice exam answers:', error);
        await transaction.rollback(); // Rollback everything on error
        return res.status(500).json({
            status: 'fail',
            message: 'Internal server error',
        });
    }
};

exports.submitRateScaleCommentExamAnswers = async (req, res) => {
    try {
        const { candidate_id, exam_id, allAnswers } = req.body;

        // Validate input
        if (!candidate_id || !exam_id || !Array.isArray(allAnswers)) {
            return res.status(400).json({
                status: 'fail',
                message: 'candidate_id, exam_id and allAnswers array are required'
            });
        }

        // Step 1: Create a record in candidates_rate_scale_exams
        const examRecord = await db.CandidatesRateScaleExam.create({
            candidate_id,
            exam_id
        });

        // Step 2: Create all answers in candidates_rate_scale_answers
        const answersData = allAnswers.map((item) => ({
            score: item.answer,
            exam_id: examRecord.id,
            question_id: item.question_id,
            comment: item.comment
        }));

        await db.CandidatesRateScaleAnswer.bulkCreate(answersData);

        return res.status(201).json({
            status: 'success',
            message: 'Exam answers submitted successfully',
            examRecordId: examRecord.id,
        });
    } catch (error) {
        console.error('Error submitting exam answers:', error);
        return res.status(500).json({
            status: 'fail',
            message: 'Internal server error',
        });
    }
};

exports.fetchAllCandidateScores = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "candidate_id is missing or invalid"
            });
        }

        // Fetch exams for this candidate
        const exams = await db.CandidatesRateScaleExam.findAll({
            include: [
                {
                    model: db.Exam,
                    as: "exam",
                    required: true,
                    attributes: ["code"],
                    where: { type: "rating scale" },
                },
            ],
            where: { candidate_id: id },
        });


        // 2️⃣ Fetch all supporting data
        const questionCodes = await db.ExamResultCode.findAll();
        const questions = await db.RatingScaleQuestion.findAll();

        // Convert to maps for quick lookups
        const questionsMap = new Map(questions.map(q => [q.id, q]));
        const codeMap = new Map(questionCodes.map(c => [c.id, c.name]));

        // Final result object (keyed by exam code)
        const results = {};

        // 3️⃣ Process each exam
        for (const exam of exams) {
            const answers = await db.CandidatesRateScaleAnswer.findAll({
                where: { exam_id: exam.id },
            });

            const groupedScores = {};

            // 4️⃣ Loop through each answer
            for (const ans of answers) {
                const question = questionsMap.get(ans.question_id);
                if (!question) continue;

                // Apply reverse logic
                let score = ans.score;
                if (question.reverse) {
                    score = question.rate_scale + 1 - ans.score;
                }

                // Group by code_id
                const codeId = question.code_id;
                if (!groupedScores[codeId]) groupedScores[codeId] = 0;
                groupedScores[codeId] += score;
            }

            // 5️⃣ Convert code IDs to readable names
            const readableScores = {};
            for (const [codeId, totalScore] of Object.entries(groupedScores)) {
                const codeName = codeMap.get(Number(codeId)) || `Code ${codeId}`;
                readableScores[codeName] = totalScore;
            }

            // 6️⃣ Assign to results object with exam code as key
            results[exam.exam.code] = readableScores;
        }

        return res.status(200).json({
            status: "success",
            message: "Candidate exam scores calculated successfully",
            results,
        });
    } catch (error) {
        console.error("Error fetching candidate scores:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.fetchAllCandidatesScores = async (req, res) => {
    try {
        // Load all candidates
        const candidates = await db.PeCandidate.findAll({
            attributes: ["id", "name"],
        });

        // Preload rating-scale lookup tables
        const questionCodes = await db.ExamResultCode.findAll();
        const questions = await db.RatingScaleQuestion.findAll();

        const questionsMap = new Map(questions.map(q => [q.id, q]));
        const codeMap = new Map(questionCodes.map(c => [c.id, c.name]));


        // Preload MCQ lookup tables (performance!)
        const mcqQuestions = await db.McqQuestion.findAll();
        const mcqChoices = await db.McqChoice.findAll();

        const mcqQuestionsMap = new Map(mcqQuestions.map(q => [q.id, q]));
        const mcqChoicesMap = new Map(mcqChoices.map(c => [c.id, c]));


        const finalResults = [];

        // Loop candidates
        for (const cand of candidates) {

            // Fetch only relevant exams (OCEAN, CAT, SJT)
            const rateScaleExams = await db.CandidatesRateScaleExam.findAll({
                include: [
                    {
                        model: db.Exam,
                        as: "exam",
                        required: true,
                        attributes: ["name", "code", "type"],
                        where: {
                            code: {
                                [Op.in]: ["(OCEAN)"]
                            }
                        },
                    },
                ],
                where: { candidate_id: cand.id },
            });

            const mcqExams = await db.CandidatesMcqExam.findAll({
                include: [
                    {
                        model: db.Exam,
                        as: "exam",
                        required: true,
                        attributes: ["name", "code", "type"],
                        where: {
                            code: {
                                [Op.in]: ["(CAT)", "(SJT)"]
                            }
                        },
                    },
                ],
                where: { candidate_id: cand.id },
            });

            const exams = [...rateScaleExams, ...mcqExams];

            const candidateScores = {};

            // Loop exams
            for (const exam of exams) {

                // GROUPED results container
                let groupedScores = {};

                /* rating scale*/
                if (exam.exam.type === "rating scale") {

                    const answers = await db.CandidatesRateScaleAnswer.findAll({
                        where: { exam_id: exam.id },
                    });

                    for (const ans of answers) {
                        const q = questionsMap.get(ans.question_id);
                        if (!q) continue;

                        let score = ans.score;
                        if (q.reverse) score = q.rate_scale + 1 - ans.score;

                        if (!groupedScores[q.code_id]) groupedScores[q.code_id] = 0;
                        groupedScores[q.code_id] += score;
                    }


                    /*MCQ grouped by code*/
                } else if (exam.exam.type === "MCQ") {

                    const answers = await db.CandidatesMcqAnswer.findAll({
                        where: { exam_id: exam.id },
                    });

                    let totalQuestions = answers.length;
                    let totalCorrect = 0;

                    for (const ans of answers) {
                        const choice = mcqChoicesMap.get(ans.choice_id);
                        if (choice && choice.status === true) {
                            totalCorrect++;
                        }
                    }

                    const percentage =
                        totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

                    // ⭐ DIRECT MCQ OUTPUT – NO GROUPING
                    candidateScores[exam.exam.code] = Number(percentage.toFixed(2));
                }


                if (exam.exam.type === "rating scale") {
                    const readableScores = {};

                    for (const [codeId, totalScore] of Object.entries(groupedScores)) {
                        const codeName = codeMap.get(Number(codeId)) || `Code ${codeId}`;
                        readableScores[codeName] = totalScore;
                    }

                    candidateScores[exam.exam.code] = readableScores;
                }
            }

            // Push final candidate result
            finalResults.push({
                candidate_id: cand.id,
                candidate_name: cand.name,
                scores: candidateScores,
            });
        }

        return res.status(200).json({
            status: "success",
            message: "All candidates exam scores calculated successfully",
            data: finalResults,
        });

    } catch (error) {
        console.error("Error fetching all candidates scores:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.fetchAllCandidateMCQScores = async (req, res) => {
    try {
        const { id } = req.params;

        // 1️⃣ Fetch exams for this candidate (only MCQ type)
        const exams = await db.CandidatesMcqExam.findAll({
            include: [
                {
                    model: db.Exam,
                    as: "exam",
                    required: true,
                    attributes: ["code"],
                    where: { type: "MCQ" },
                },
            ],
            where: { candidate_id: id },
        });

        // 2️⃣ Prepare final results
        const results = {};

        // 3️⃣ Process each exam
        for (const exam of exams) {
            // Get all answers for this exam
            const answers = await db.CandidatesMcqAnswer.findAll({
                where: { exam_id: exam.id },
            });

            let totalQuestions = answers.length;
            let totalCorrect = 0;

            // 4️⃣ Loop through each answer
            for (const ans of answers) {
                // Fetch the selected choice to see if it's correct
                const choice = await db.McqChoice.findByPk(ans.choice_id, {
                    attributes: ["status"],
                });

                if (choice && choice.status === true) {
                    totalCorrect += 1;
                }
            }

            // Avoid division by zero
            const score = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

            // 5️⃣ Store result using exam code as key
            results[exam.exam.code] = {
                totalQuestions,
                totalCorrect,
                percentage: Number(score.toFixed(2)),
            };
        }

        return res.status(200).json({
            status: "success",
            message: "Candidate MCQ exam scores calculated successfully",
            results,
        });
    } catch (error) {
        console.error("Error fetching candidate MCQ scores:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.fetchTotalScores = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch exams for this candidate
        const exams = await db.CandidatesRateScaleExam.findAll({
            include: [
                {
                    model: db.Exam,
                    as: "exam",
                    required: true,
                    attributes: ["code"],
                    where: { type: "rating scale" },
                },
            ],
            where: { candidate_id: id },
        });


        // 2️⃣ Fetch all supporting data
        const questionCodes = await db.ExamResultCode.findAll();
        const questions = await db.RatingScaleQuestion.findAll();

        // Convert to maps for quick lookups
        const questionsMap = new Map(questions.map(q => [q.id, q]));
        const codeMap = new Map(questionCodes.map(c => [c.id, c.name]));

        // Final result object (keyed by exam code)
        const results = {};

        // 3️⃣ Process each exam
        for (const exam of exams) {
            const answers = await db.CandidatesRateScaleAnswer.findAll({
                where: { exam_id: exam.id },
            });

            const groupedScores = {};

            // 4️⃣ Loop through each answer
            for (const ans of answers) {
                const question = questionsMap.get(ans.question_id);
                if (!question) continue;

                // Apply reverse logic
                let score = ans.score;
                if (question.reverse) {
                    score = question.rate_scale + 1 - ans.score;
                }

                // Group by code_id
                const codeId = question.code_id;
                if (!groupedScores[codeId]) groupedScores[codeId] = 0;
                groupedScores[codeId] += score;
            }

            // 5️⃣ Convert code IDs to readable names
            const readableScores = {};
            for (const [codeId, totalScore] of Object.entries(groupedScores)) {
                const codeName = codeMap.get(Number(codeId)) || `Code ${codeId}`;
                readableScores[codeName] = totalScore;
            }

            // 6️⃣ Assign to results object with exam code as key
            results[exam.exam.code] = readableScores;
        }
        return res.status(200).json({
            status: "success",
            message: "Candidate MCQ exam scores calculated successfully",
        });
    } catch (error) {
        console.error("Error fetching candidate MCQ scores:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.DashboardData = async (req, res) => {
    try {

        const candidates = await db.PeCandidate.findAll();

        const mcqExams = await db.CandidatesMcqExam.findAll({
            include: [
                {
                    model: db.Exam,
                    as: "exam",
                    required: true,
                    attributes: ["name", "code", "type"],
                },
                {
                    model: db.PeCandidate,
                    as: "candidate",
                    required: true,
                    attributes: ["recommended_country"]
                }
            ],
        });

        const ratingScaleExams = await db.CandidatesRateScaleExam.findAll({
            include: [
                {
                    model: db.Exam,
                    as: "exam",
                    required: true,
                    attributes: ["name", "code", "type"],
                },
                {
                    model: db.PeCandidate,
                    as: "candidate",
                    required: true,
                    attributes: ["recommended_country"]
                }
            ],
        });

        const resultsByCountry = {};

        const allMCQScores = [];
        const allRatingScaleScores = [];

        for (const exam of mcqExams) {
            const answers = await db.CandidatesMcqAnswer.findAll({
                where: { exam_id: exam.id },
            });

            let totalQuestions = answers.length;
            let totalCorrect = 0;

            for (const ans of answers) {
                const choice = await db.McqChoice.findByPk(ans.choice_id, {
                    attributes: ["status"],
                });

                if (choice && choice.status === true) totalCorrect++;
            }

            const score =
                totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

            allMCQScores.push({
                examName: exam.exam.name,
                percentage: Number(score.toFixed(2)),
                country: exam.candidate.recommended_country,
            });
        }

        const questionCodes = await db.ExamResultCode.findAll();
        const questions = await db.RatingScaleQuestion.findAll();
        const codeMap = new Map(questionCodes.map(c => [c.id, c.name]));
        const questionsMap = new Map(questions.map(q => [q.id, q]));

        for (const exam of ratingScaleExams) {
            const answers = await db.CandidatesRateScaleAnswer.findAll({
                where: { exam_id: exam.id },
            });

            const groupedScores = {};

            for (const ans of answers) {
                const question = questionsMap.get(ans.question_id);
                if (!question) continue;

                let score = ans.score;
                if (question.reverse) score = question.rate_scale + 1 - ans.score;

                const codeId = question.code_id;
                if (!groupedScores[codeId]) groupedScores[codeId] = 0;
                groupedScores[codeId] += score;
            }

            const readableScores = {};
            for (const [codeId, val] of Object.entries(groupedScores)) {
                const codeName = codeMap.get(Number(codeId)) || `Code ${codeId}`;
                readableScores[codeName] = val;
            }

            const values = Object.values(readableScores);
            const sum = values.reduce((acc, v) => acc + v, 0);
            const avgScore = values.length > 0 ? sum / values.length : 0;

            allRatingScaleScores.push({
                examName: exam.exam.name,
                percentage: Number(avgScore.toFixed(2)),
                country: exam.candidate.recommended_country,
            });
        }

        const tempTotal = {};

        [...allMCQScores, ...allRatingScaleScores].forEach(item => {
            if (!tempTotal[item.examName]) {
                tempTotal[item.examName] = { sum: 0, count: 0 };
            }
            tempTotal[item.examName].sum += item.percentage;
            tempTotal[item.examName].count++;
        });

        // Convert total object → array
        const total = Object.keys(tempTotal).map(name => ({
            name,
            performance: Number(
                (tempTotal[name].sum / tempTotal[name].count).toFixed(2)
            )
        }));



        [...allMCQScores, ...allRatingScaleScores].forEach(item => {
            const country = item.country || "Unknown";

            if (!resultsByCountry[country]) {
                resultsByCountry[country] = {};
            }

            if (!resultsByCountry[country][item.examName]) {
                resultsByCountry[country][item.examName] = { sum: 0, count: 0 };
            }

            resultsByCountry[country][item.examName].sum += item.percentage;
            resultsByCountry[country][item.examName].count++;
        });

        const formattedResultsByCountry = {};

        for (const country in resultsByCountry) {
            formattedResultsByCountry[country] = [];

            for (const name in resultsByCountry[country]) {
                const data = resultsByCountry[country][name];
                const avg = data.sum / data.count;

                formattedResultsByCountry[country].push({
                    name: name,
                    performance: Number(avg.toFixed(2))
                });
            }
        }

        return res.status(200).json({
            status: "success",
            message: "Dashboard data fetched successfully",
            candidates,
            total,
            resultsByCountry: formattedResultsByCountry
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.getCandidatesData = async (req, res) => {
    try {

        const candidates = await db.PeCandidate.findAll({
            order: [['id', 'DESC']],
        });

        res.json({
            success: true,
            candidates
        });
    } catch (err) {
        console.error("Error fetching manager evaluation template:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch manager evaluation template",
            error: err.message
        });
    }
};

exports.createCandidateUser = async (req, res) => {
    try {
        const {
            name,
            id_number,
            passport_number,
            email,
            organization_id,
            category,
            candidate_id,
            phone_number,
            recommended_country,
            theory_test_date,
            theory_start_time,
            theory_end_time,
            theory_test_score,
            practical_test_date,
            practical_start_time,
            practical_end_time,
            practical_test_score,
            fc_test_date,
            fc_start_time,
            fc_end_time,
            fc_test_score,
            nationality,
            profession,
            profession_code
        } = req.body;

        const getFilePath = (field) => {
            const f = req.files?.[field]?.[0];
            if (!f) return null;
            return `uploads/pe/${f.filename}`; // relative path saved in DB
        };

        // Normalize and validate email
        const normalizedEmail = email?.toLowerCase().trim() || null;

        if (normalizedEmail && !validator.isEmail(normalizedEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }


        if (!validator.isEmail(normalizedEmail)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Generate random password and candidate_id
        const password = Math.floor(10000 + Math.random() * 90000).toString();
        const hashedPassword = await hashPassword(password);

        // Transaction for user + candidate creation
        const result = await db.User.sequelize.transaction(async (transaction) => {
            const lastUser = await db.User.findOne({
                attributes: ["code"],
                order: [["code", "DESC"]],
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            const newCode = lastUser?.code ? lastUser.code + 1 : 1000;

            const user = await db.User.create(
                {
                    code: newCode,
                    password: hashedPassword,
                    role_id: 33,
                },
                { transaction }
            );

            const clean = (v) => (v === "" ? null : v);

            const candidate_data = await db.PeCandidate.create(
                {
                    name,
                    id_number,
                    passport_number: clean(passport_number),
                    email: normalizedEmail || null,
                    organization_id,
                    user_id: user.id,
                    category: category || null,
                    candidate_id,
                    phone_number: phone_number || null,
                    recommended_country: recommended_country || null,
                    candidate_picture: getFilePath("candidate_picture"),
                    candidate_passport: getFilePath("candidate_passport"),
                    candidate_ticket: getFilePath("candidate_ticket"),
                    candidate_picture_passport: getFilePath("candidate_picture_passport"),
                    candidate_picture_ticket: getFilePath("candidate_picture_ticket"),
                    fc_back_img: getFilePath("fc_back_img"),
                    fc_side_img: getFilePath("fc_side_img"),
                    practical_back_img: getFilePath("practical_back_img"),
                    practical_side_img: getFilePath("practical_side_img"),
                    theory_back_img: getFilePath("theory_back_img"),
                    theory_side_img: getFilePath("theory_side_img"),
                    practical_start_date: practical_test_date
                        ? new Date(`${practical_test_date}T${practical_start_time || "00:00:00"}`)
                        : null,
                    practical_end_date: practical_test_date
                        ? new Date(`${practical_test_date}T${practical_end_time || "00:00:00"}`)
                        : null,
                    practical_test_score: practical_test_score || null,

                    theory_start_date: theory_test_date
                        ? new Date(`${theory_test_date}T${theory_start_time || "00:00:00"}`)
                        : null,
                    theory_end_date: theory_test_date
                        ? new Date(`${theory_test_date}T${theory_end_time || "00:00:00"}`)
                        : null,
                    theory_test_score: theory_test_score || null,

                    fc_start_date: fc_test_date
                        ? new Date(`${fc_test_date}T${fc_start_time || "00:00:00"}`)
                        : null,
                    fc_end_date: fc_test_date
                        ? new Date(`${fc_test_date}T${fc_end_time || "00:00:00"}`)
                        : null,
                    fc_test_score: fc_test_score || null,
                    nationality: nationality || null,
                    profession: profession || null,
                    profession_code: profession_code || null,
                },
                { transaction }
            );

            // ✅ return both so we can access them later
            return { user, candidate_data };
        });

        // JWT setup
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }

        const token = jwt.sign({ id: result.user.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(201).json({
            message: "User created successfully",
            code: result.user.code,
            token,
            candidate_data: result.candidate_data,
            password, // return raw password (consider removing later for security)
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
};

exports.updateCandidateUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || id === "undefined") {
            return res.status(400).json({ message: "Missing candidate id in URL" });
        }

        const idInt = Number(id);
        if (!Number.isInteger(idInt)) {
            return res.status(400).json({ message: "Invalid candidate id" });
        }

        const {
            name,
            id_number,
            passport_number,
            email,
            organization_id,
            category,
            candidate_id,
            phone_number,
            recommended_country,
            theory_test_date,
            theory_start_time,
            theory_end_time,
            theory_test_score,
            practical_test_date,
            practical_start_time,
            practical_end_time,
            practical_test_score,
            fc_test_date,
            fc_start_time,
            fc_end_time,
            fc_test_score,
            nationality,
            profession,
            profession_code
        } = req.body;

        // Check if candidate exists
        const candidate = await db.PeCandidate.findByPk(idInt);
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        // Normalize & validate email
        const normalizedEmail = email?.toLowerCase().trim();
        if (email !== undefined) {
            if (!validator.isEmail(normalizedEmail || "")) {
                return res.status(400).json({ message: "Invalid email format" });
            }
        }
        const hasBodyUpdates = req.body && Object.keys(req.body).length > 0;
        const hasFileUpdates = req.files && Object.keys(req.files).length > 0;

        if (!hasBodyUpdates && !hasFileUpdates) {
            return res.status(400).json({ message: "No fields provided to update" });
        }

        if (name !== undefined && !name) {
            return res.status(400).json({ message: "name cannot be empty" });
        }
        if (id_number !== undefined && !id_number) {
            return res.status(400).json({ message: "id_number cannot be empty" });
        }
        if (organization_id !== undefined && !organization_id) {
            return res.status(400).json({ message: "organization_id cannot be empty" });
        }
        if (candidate_id !== undefined && !candidate_id) {
            return res.status(400).json({ message: "candidate_id cannot be empty" });
        }

        const getFilePath = (field) => {
            const f = req.files?.[field]?.[0];
            if (!f) return undefined;
            return `uploads/pe/${f.filename}`;
        };

        // Start safe transaction
        const result = await db.PeCandidate.sequelize.transaction(async (transaction) => {
            // Build update object
            const updateData = {};
            const clean = (v) => (v === "" ? null : v);

            if (name !== undefined) updateData.name = name;
            if (id_number !== undefined) updateData.id_number = id_number;
            if (passport_number !== undefined) updateData.passport_number = clean(passport_number);
            if (email !== undefined) updateData.email = normalizedEmail || null;
            if (organization_id !== undefined) updateData.organization_id = organization_id;
            if (category !== undefined) updateData.category = category || null;
            if (phone_number !== undefined) updateData.phone_number = phone_number || null;
            if (recommended_country !== undefined) updateData.recommended_country = recommended_country || null;

            if (nationality !== undefined) updateData.nationality = nationality || null;
            if (profession !== undefined) updateData.profession = profession || null;
            if (profession_code !== undefined) updateData.profession_code = profession_code || null;

            // Dates: only set when relevant field(s) were provided
            if (practical_test_date !== undefined || practical_start_time !== undefined) {
                updateData.practical_start_date = practical_test_date
                    ? new Date(`${practical_test_date}T${practical_start_time || "00:00:00"}`)
                    : null;
            }
            if (practical_test_date !== undefined || practical_end_time !== undefined) {
                updateData.practical_end_date = practical_test_date
                    ? new Date(`${practical_test_date}T${practical_end_time || "00:00:00"}`)
                    : null;
            }
            if (practical_test_score !== undefined) updateData.practical_test_score = practical_test_score || null;

            if (theory_test_date !== undefined || theory_start_time !== undefined) {
                updateData.theory_start_date = theory_test_date
                    ? new Date(`${theory_test_date}T${theory_start_time || "00:00:00"}`)
                    : null;
            }
            if (theory_test_date !== undefined || theory_end_time !== undefined) {
                updateData.theory_end_date = theory_test_date
                    ? new Date(`${theory_test_date}T${theory_end_time || "00:00:00"}`)
                    : null;
            }
            if (theory_test_score !== undefined) updateData.theory_test_score = theory_test_score || null;

            if (fc_test_date !== undefined || fc_start_time !== undefined) {
                updateData.fc_start_date = fc_test_date
                    ? new Date(`${fc_test_date}T${fc_start_time || "00:00:00"}`)
                    : null;
            }
            if (fc_test_date !== undefined || fc_end_time !== undefined) {
                updateData.fc_end_date = fc_test_date
                    ? new Date(`${fc_test_date}T${fc_end_time || "00:00:00"}`)
                    : null;
            }
            if (fc_test_score !== undefined) updateData.fc_test_score = fc_test_score || null;


            // Handle file updates
            const files = [
                "candidate_picture", "candidate_passport", "candidate_ticket",
                "candidate_picture_passport", "candidate_picture_ticket",
                "fc_back_img", "fc_side_img",
                "practical_back_img", "practical_side_img",
                "theory_back_img", "theory_side_img"
            ];

            files.forEach(field => {
                const path = getFilePath(field);
                if (path) updateData[field] = path;
            });

            // Only update candidate_id if it’s actually different
            if (candidate_id !== undefined) {
                const oldId = String(candidate.candidate_id);
                const newId = String(candidate_id);

                if (oldId !== newId) {
                    updateData.candidate_id = candidate_id;
                }
                // if same: do nothing (don't send it in updateData)
            }

            const candidate_data = await candidate.update(updateData, { transaction });
            return { candidate_data };
        });

        // Return 200 for updates
        res.status(200).json({
            message: "Candidate updated successfully",
            candidate_data: result.candidate_data,
        });
    } catch (error) {
        console.error("Update Candidate Error:", error);

        // Handle duplicate constraint error cleanly
        if (error.name === "SequelizeUniqueConstraintError") {
            return res
                .status(409)
                .json({
                    message: `Duplicate value for a unique field: ${error.errors[0]?.message}`,
                });
        }

        res.status(500).json({
            message: error.message || "Server error while updating candidate",
        });
    }
};