const db = require('../db/models');
const pdmsService = require('../services/pdmsService');

exports.allWatomsForms = async (req, res) => {
    try {
        const forms = await pdmsService.getWatomsFormsData();

        res.status(200).json({
            status: "success",
            message: "forms fetched successfully",
            forms
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.allWisdomForms = async (req, res) => {
    try {
        const forms = await pdmsService.getWisdomFormsData();

        res.status(200).json({
            status: "success",
            message: "forms fetched successfully",
            forms
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchPedagogicalTest = async (req, res) => {
    try {
        const test = await pdmsService.getPedagogicalTestData();

        res.status(200).json({
            status: "success",
            message: "pedagogical test got fetched successfully",
            test
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.submitMcqExamAnswers = async (req, res) => {
    const transaction = await db.sequelize.transaction();

    try {
        const { user_id, exam_id, allAnswers } = req.body;

        // Validate input
        if (!user_id || !exam_id || !Array.isArray(allAnswers)) {
            await transaction.rollback();
            return res.status(400).json({
                status: 'fail',
                message: 'user_id, exam_id and allAnswers array are required'
            });
        }

        // Step 1: Create exam attempt
        const examRecord = await db.McqExam.create(
            {
                user_id,
                exam_id
            },
            { transaction }
        );

        // Step 2: Prepare answers
        const answersData = allAnswers.map(item => ({
            choice_id: item.choice_id,
            exam_id: examRecord.id,
            question_id: item.question_id
        }));

        // Step 3: Insert answers
        await db.McqAnswer.bulkCreate(answersData, { transaction });

        // Step 4: Commit if EVERYTHING succeeds
        await transaction.commit();

        return res.status(201).json({
            status: 'success',
            message: 'Exam answers submitted successfully',
            examRecordId: examRecord.id
        });

    } catch (error) {
        // Any error rolls back EVERYTHING
        await transaction.rollback();

        console.error('Error submitting exam answers:', error);

        return res.status(500).json({
            status: 'fail',
            message: 'Internal server error'
        });
    }
};

exports.fetchWatomsPdmsDashboard = async (req, res) => {
    try {
        const dashboard = await pdmsService.getWatomsDashboardData();

        res.status(200).json({
            status: "success",
            message: "dashboard got fetched successfully",
            dashboard
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchWisdomPdmsDashboard = async (req, res) => {
    try {
        const dashboard = await pdmsService.getWisdomDashboardData();

        res.status(200).json({
            status: "success",
            message: "dashboard got fetched successfully",
            dashboard
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};