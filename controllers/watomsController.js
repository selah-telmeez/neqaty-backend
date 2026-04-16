const {
    sequelize, PublishedNews, ManagerEvaluationTemplate,
    ManagerEvaluationCategory, ManagerEvaluation, TempOrgAvgTask,
    ManagerComment, TraineeRegistrationData, EmployeePerformanceReport,
    EmployeePrTask, User, Employee,
    Subject, Teacher, Class,
    Student, Session
} = require("../db/models");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const { Op } = require("sequelize");
const watomsService = require('../services/watomsService');

// Watoms Vtcs
exports.fetchWatomsRelatedVtcs = async (req, res) => {
    try {
        const vtcs = await watomsService.getWatomsRelatedVtcsData();

        res.status(200).json({
            status: "success",
            message: "vtcs data got fetched successfully",
            vtcs
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchWatomsDashboard = async (req, res) => {
    try {
        const year = Number(req.params.year);
        const stage = req.params.stage;
        const subject = req.params.subject;
        const specialization = req.params.specialization;
        const fromDate = req.params.from;
        const toDate = req.params.to;
        const userOrganization = req.params.userOrganization;
        const dashboard = await watomsService.getWatomsDashboardData(year, stage, subject, specialization, fromDate, toDate, userOrganization);

        res.status(200).json({
            status: "success",
            message: "dashboard got fetched successfully",
            dashboard
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchWatomsDashboardGeneralInformation = async (req, res) => {
    try {
        const generalInfo = await watomsService.getWatomsDashboardGeneralInfoData();

        res.status(200).json({
            status: "success",
            message: "dashboard general info got fetched successfully",
            generalInfo
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchWorkshopPerformanceReport = async (req, res) => {
    try {
        const { vtcs, workshops } = req.query;
        const teReport = await watomsService.getWatomsTrainingEnvironmentPerformanceReportData(vtcs, workshops);
        const bfReport = await watomsService.getWatomsBFPerformanceReportData(vtcs, workshops);

        res.status(200).json({
            status: "success",
            message: "workshop performance report got fetched successfully",
            report: {
                teReport,
                bfReport
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

exports.fetchWatomsAllEmployees = async (req, res) => {
    try {
        const employees = await watomsService.getWatomsEmployees();

        res.status(200).json({
            status: "success",
            message: "dashboard general info got fetched successfully",
            employees
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

exports.fetchAllTrainers = async (req, res) => {
    try {
        const trainers = await watomsService.getTrainersData();

        res.status(200).json({
            status: "success",
            message: "trainers got fetched successfully",
            trainers
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.fetchWatomsTrainersRegistrations = async (req, res) => {
    try {
        const registrations = await watomsService.getWatomsTrainersRegistrationsData();

        res.status(200).json({
            status: "success",
            message: "registrations got fetched successfully",
            registrations
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

exports.publishNews = async (req, res) => {
    try {
        const { title, description, date, organization_id } = req.body;

        // Define relativePath based on whether a file was uploaded
        let relativePath = null;
        if (req.file) {
            relativePath = path.join("news", organization_id.toString(), req.file.filename);
        }

        const news = await PublishedNews.create({
            title,
            description,
            date,
            organization_id,
            image_path: relativePath
        });

        res.json({ message: "News published successfully", news });
    } catch (err) {
        console.error("Error uploading news:", err);
        res.status(500).json({ message: "Upload failed", error: err.message });
    }
}

exports.getNewsList = async (req, res) => {
    try {
        const { organization_id } = req.query;

        // Build where clause for filtering by organization
        const whereClause = organization_id ? { organization_id } : {};

        const newsList = await PublishedNews.findAll({
            where: whereClause,
            order: [['date', 'DESC']], // Most recent first
            attributes: [
                'id', 'title', 'description', 'date',
                'image_path', 'organization_id', 'notification', 'createdAt'
            ]
        });

        // Transform the data to include full image URLs
        const transformedNewsList = newsList.map(news => {
            const newsData = news.toJSON();
            if (newsData.image_path) {
                // Replace backslashes with forward slashes
                let cleanPath = newsData.image_path.replace(/\\/g, '/');

                // Remove any "uploads/" prefix if present in the path
                cleanPath = cleanPath.replace(/^\/?uploads\/news\//, 'news/');

                // News images are stored in news/ folder, so use /news route instead of /uploads
                if (cleanPath.includes('news/')) {
                    // Ensure it starts with /news/
                    if (cleanPath.startsWith('/news/')) {
                        newsData.image_url = cleanPath;
                    } else if (cleanPath.startsWith('news/')) {
                        newsData.image_url = `/${cleanPath}`;
                    } else {
                        // Extract organization ID and filename
                        const match = cleanPath.match(/news\/(\d+\/[^\/]+)/);
                        if (match) {
                            newsData.image_url = `/news/${match[1]}`;
                        } else {
                            newsData.image_url = `/${cleanPath}`;
                        }
                    }
                } else {
                    // If it doesn't contain 'news/', assume it's a regular upload
                    newsData.image_url = `/uploads/${cleanPath}`;
                }

            } else {
                newsData.image_url = null;
                console.log(`⚠️ News ID: ${newsData.id} has no image_path`);
            }
            return newsData;
        });

        res.json({
            success: true,
            count: transformedNewsList.length,
            data: transformedNewsList
        });
    } catch (err) {
        console.error("Error fetching news list:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch news list",
            error: err.message
        });
    }
}

exports.addNewsImage = async (req, res) => {
    try {
        const { newsId } = req.params;

        // Get the news item to find organization_id
        const news = await PublishedNews.findByPk(newsId);
        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file provided"
            });
        }

        const organizationId = news.organization_id;
        const relativePath = path.join("news", organizationId.toString(), req.file.filename);

        // Note: We're adding the image to the directory, but not updating the news.image_path
        // The image_path stays as the original, but getNewsImages will find all images in the directory

        res.json({
            success: true,
            message: "Image added successfully",
            image: {
                filename: req.file.filename,
                path: relativePath.replace(/\\/g, '/'),
                url: `/news/${organizationId}/${req.file.filename}`
            }
        });
    } catch (err) {
        console.error("Error adding news image:", err);
        res.status(500).json({
            success: false,
            message: "Failed to add image",
            error: err.message
        });
    }
};

exports.addTestImagesToNews = async (req, res) => {
    try {
        const { newsId, count = 3 } = req.body;

        // Get the news item to find organization_id
        const news = await PublishedNews.findByPk(newsId);
        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found"
            });
        }

        const organizationId = news.organization_id;
        const newsDir = path.join(__dirname, '..', 'news', organizationId.toString());

        // Ensure directory exists
        if (!fs.existsSync(newsDir)) {
            fs.mkdirSync(newsDir, { recursive: true });
        }

        // Get existing images in the directory
        const existingFiles = fs.existsSync(newsDir) ? fs.readdirSync(newsDir) : [];
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
        let existingImages = existingFiles.filter(file =>
            imageExtensions.includes(path.extname(file).toLowerCase())
        );

        // If no images in this directory, try to find images from other organizations
        if (existingImages.length === 0) {
            const newsBaseDir = path.join(__dirname, '..', 'news');
            if (fs.existsSync(newsBaseDir)) {
                const orgDirs = fs.readdirSync(newsBaseDir, { withFileTypes: true })
                    .filter(d => d.isDirectory())
                    .map(d => d.name);

                for (const orgId of orgDirs) {
                    const otherOrgDir = path.join(newsBaseDir, orgId);
                    const otherFiles = fs.readdirSync(otherOrgDir);
                    const otherImages = otherFiles.filter(file =>
                        imageExtensions.includes(path.extname(file).toLowerCase())
                    );

                    if (otherImages.length > 0) {
                        // Copy first image from another organization to this one
                        const sourcePath = path.join(otherOrgDir, otherImages[0]);
                        const ext = path.extname(otherImages[0]);
                        const newFilename = `imported-${Date.now()}${ext}`;
                        const destPath = path.join(newsDir, newFilename);

                        fs.copyFileSync(sourcePath, destPath);
                        existingImages = [newFilename];
                        console.log(`📸 Copied source image from org ${orgId} to org ${organizationId}`);
                        break;
                    }
                }
            }
        }

        if (existingImages.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No existing images found to copy. Please upload at least one image first."
            });
        }

        // Copy existing images to create test images
        const copiedImages = [];
        for (let i = 0; i < count; i++) {
            const sourceImage = existingImages[0]; // Use the first image as source
            const sourcePath = path.join(newsDir, sourceImage);
            const ext = path.extname(sourceImage);
            const timestamp = Date.now() + i;
            const newFilename = `test-${timestamp}${ext}`;
            const destPath = path.join(newsDir, newFilename);

            // Copy the file
            fs.copyFileSync(sourcePath, destPath);

            copiedImages.push({
                filename: newFilename,
                path: `news/${organizationId}/${newFilename}`,
                url: `/news/${organizationId}/${newFilename}`
            });
        }

        console.log(`✅ Added ${copiedImages.length} test images to news ${newsId}`);

        res.json({
            success: true,
            message: `Added ${copiedImages.length} test images successfully`,
            images: copiedImages
        });
    } catch (err) {
        console.error("Error adding test images:", err);
        res.status(500).json({
            success: false,
            message: "Failed to add test images",
            error: err.message
        });
    }
};

exports.getNewsImages = async (req, res) => {
    try {
        const { newsId } = req.params;

        // Get the news item to find organization_id
        const news = await PublishedNews.findByPk(newsId);
        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found"
            });
        }

        const organizationId = news.organization_id;
        const newsDir = path.join(__dirname, '..', 'news', organizationId.toString());

        // Check if directory exists
        if (!fs.existsSync(newsDir)) {
            console.log(`❌ Directory does not exist: ${newsDir}`);
            return res.json({
                success: true,
                images: []
            });
        }

        // Read all files from the directory
        const files = fs.readdirSync(newsDir);
        console.log(`📄 Found ${files.length} files in directory:`, files);

        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

        // Filter only image files and create full URLs
        const images = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                const isImage = imageExtensions.includes(ext);
                console.log(`   ${file} - ${ext} - ${isImage ? '✅ Image' : '❌ Not an image'}`);
                return isImage;
            })
            .map(file => {
                const cleanPath = `news/${organizationId}/${file}`.replace(/\\/g, '/');
                const imageData = {
                    filename: file,
                    path: cleanPath,
                    url: `/news/${organizationId}/${file}`,
                    fullUrl: null // Will be constructed on frontend with proper base URL
                };
                console.log(`   📸 Image data for news ${newsId}:`, imageData);
                return imageData;
            })
            .sort((a, b) => {
                // Sort by filename (timestamp-based) descending
                return b.filename.localeCompare(a.filename);
            });

        console.log(`✅ Returning ${images.length} images for news ${newsId}`);

        res.json({
            success: true,
            images: images
        });
    } catch (err) {
        console.error("❌ Error fetching news images:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch news images",
            error: err.message
        });
    }
};

exports.updateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { notification } = req.body;

        // Validate input
        if (typeof notification !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "Notification value must be a boolean (true or false)"
            });
        }

        // Check if the news exists
        const news = await PublishedNews.findByPk(id);
        if (!news) {
            return res.status(404).json({
                success: false,
                message: "News not found"
            });
        }

        // Update the notification status
        await PublishedNews.update(
            { notification },
            { where: { id } }
        );

        // Fetch the updated news to return
        const updatedNews = await PublishedNews.findByPk(id, {
            attributes: ['id', 'title', 'description', 'date', 'image_path', 'organization_id', 'notification', 'updatedAt']
        });

        res.json({
            success: true,
            message: "Notification status updated successfully",
            data: updatedNews
        });
    } catch (err) {
        console.error("Error updating notification:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update notification status",
            error: err.message
        });
    }
}

exports.getManagerEvaluationTemplate = async (req, res) => {
    try {
        const categories = await ManagerEvaluationCategory.findAll({
            attributes: ['id', 'title'],
            include: [
                {
                    model: ManagerEvaluationTemplate,
                    as: 'templates',
                    attributes: ['id', 'title', 'max_score']
                }
            ],
            order: [['id', 'ASC']]
        });

        // Transform into the desired shape
        const result = categories.map(category => ({
            title: category.title,
            statements: category.templates.map(statement => ({
                id: statement.id,
                title: statement.title,
                max_score: statement.max_score
            }))
        }));

        res.json({
            success: true,
            data: result
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

exports.submitManagerEvaluation = async (req, res) => {
    try {
        const { employee_id, date, evaluations } = req.body;

        // Flatten the evaluations array into allEvaluation
        const allEvaluation = [
            ...evaluations[0].statements,
            ...evaluations[1].statements,
            ...evaluations[2].statements
        ];

        // Build bulk insert data
        const records = allEvaluation.map(ev => ({
            employee_id,
            date,
            status: 'confirmed',
            score: ev.score,
            template_id: ev.id
        }));

        // Insert bulk data
        await ManagerEvaluation.bulkCreate(records);

        res.json({
            success: true,
            count: records.length,
            message: `${records.length} evaluations submitted successfully`
        });
    } catch (err) {
        console.error("Error submitting manager evaluation:", err);
        res.status(500).json({
            success: false,
            message: "Failed to submit manager evaluation",
            error: err.message
        });
    }
};

exports.getManagerEvaluations = async (req, res) => {
    try {

        const { id } = req.params;

        const evaluations = await ManagerEvaluation.findAll({
            attributes: ['id', 'score', 'date', 'status', 'createdAt'],
            where: { employee_id: id },
            include: [
                {
                    model: ManagerEvaluationTemplate,
                    as: 'template',
                    attributes: ['title', 'max_score']
                }
            ],
            order: [['id', 'ASC']]
        });

        res.json({
            success: true,
            data: evaluations
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

exports.getEmployeeEvaluation = async (req, res) => {
    try {

        const { id, month } = req.params;

        if (!id || !month) {
            return res.status(400).json({
                success: false,
                message: "employee_id and month are required"
            });
        }

        const evaluations = await ManagerEvaluation.findAll({
            attributes: ['id', 'score', 'date', 'status'],
            where: { employee_id: id, date: month },
            include: [
                {
                    model: ManagerEvaluationTemplate,
                    as: 'template',
                    attributes: ['title', 'max_score']
                }
            ],
            order: [['id', 'ASC']]
        });

        res.json({
            success: true,
            data: evaluations
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

exports.updateManagerEvaluation = async (req, res) => {
    try {
        const { employee_id, date, evaluations } = req.body;

        // Flatten evaluations into a single array
        const allEvaluation = [
            ...evaluations[0].statements,
            ...evaluations[1].statements,
            ...evaluations[2].statements,
        ];

        // Loop and update each record
        for (const ev of allEvaluation) {
            await ManagerEvaluation.update(
                { score: ev.score }, // update only score
                {
                    where: {
                        employee_id,
                        date,
                        template_id: ev.id, // template id is the link to the statement
                    },
                }
            );
        }

        res.json({
            success: true,
            count: allEvaluation.length,
            message: `${allEvaluation.length} evaluations updated successfully`,
        });
    } catch (err) {
        console.error("Error updating manager evaluation:", err);
        res.status(500).json({
            success: false,
            message: "Failed to update manager evaluation",
            error: err.message,
        });
    }
};

exports.submitOrgTaskAvg = async (req, res) => {
    try {
        const { score, date, organization_id } = req.body;

        // Build bulk insert data
        const taskScore = await TempOrgAvgTask.create({
            score,
            date,
            organization_id,
        });

        res.json({
            success: true,
            taskScore
        });
    } catch (err) {
        console.error("Error submitting manager evaluation:", err);
        res.status(500).json({
            success: false,
            message: "Failed to submit manager evaluation",
            error: err.message
        });
    }
};

exports.getOrgTasksAvg = async (req, res) => {
    try {

        const { id } = req.params;

        const avgTasks = await TempOrgAvgTask.findAll({
            attributes: ['id', 'score', 'date', 'organization_id'],
            where: { organization_id: id },
            order: [['id', 'ASC']]
        });

        res.json({
            success: true,
            data: avgTasks
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

exports.submitManagerComment = async (req, res) => {
    try {
        const { comment, type, date, employee_id } = req.body;

        // Build bulk insert data
        const managerComment = await ManagerComment.create({
            comment,
            type,
            date,
            employee_id
        });

        res.json({
            success: true,
            managerComment
        });
    } catch (err) {
        console.error("Error submitting manager evaluation:", err);
        res.status(500).json({
            success: false,
            message: "Failed to submit manager evaluation",
            error: err.message
        });
    }
};

exports.getManagerComments = async (req, res) => {
    try {

        const { id } = req.params;

        const managerComments = await ManagerComment.findAll({
            attributes: ["comment", "type", "date"],
            where: { employee_id: id },
            order: [
                [
                    sequelize.literal(`CASE 
                        WHEN type = 'سلبي' THEN 1
                        WHEN type = 'ايجابي' THEN 2
                    END`),
                    "ASC"
                ],
                ["date", "DESC"]
            ]
        });

        res.json({
            success: true,
            data: managerComments
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

exports.checkTrainee = async (req, res) => {
    try {
        let { selectedUsers, checkStatus } = req.body;

        // Convert to number
        selectedUsers = Number(selectedUsers);

        if (!Number.isInteger(selectedUsers)) {
            return res.status(400).json({ message: "selectedUsers must be a number" });
        }

        const [updatedCount] = await TraineeRegistrationData.update(
            { is_new: !checkStatus },
            { where: { id: selectedUsers } }
        );

        return res.status(200).json({
            message: `${updatedCount} trainees updated successfully.`,
            updatedCount,
        });

    } catch (error) {
        console.error("Error updating trainees:", error);
        res.status(500).json({
            message: error.message || "Server error while updating users",
        });
    }
};

exports.submitEmployeePerformanceReport = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const {
            planned_working_days,
            actual_working_days,
            absence_days,
            no_of_latness,
            no_of_early_leave,
            notes,
            user_id,

            CooperationTeamwork,
            AdherenceToInstructions,
            LevelOfInitiative,
            ProblemSolvingAbility,
            TimeManagementWorkOrganization,
            CommunicationSkills,
            tasks
        } = req.body;

        // Create main report (IMPORTANT: await!)
        const report = await EmployeePerformanceReport.create({
            planned_working_days,
            actual_working_days,
            absence_days,
            no_of_latness,
            no_of_early_leave,
            notes,
            user_id,
            score_one: CooperationTeamwork,
            score_two: AdherenceToInstructions,
            score_three: LevelOfInitiative,
            score_four: ProblemSolvingAbility,
            score_five: TimeManagementWorkOrganization,
            score_six: CommunicationSkills
        }, { transaction: t });

        // Insert tasks if provided
        if (Array.isArray(tasks) && tasks.length > 0) {
            const tasksData = tasks.map(task => ({
                task,
                employees_performance_reports_id: report.id
            }));

            await EmployeePrTask.bulkCreate(tasksData, { transaction: t });
        }

        // Commit
        await t.commit();

        res.json({
            success: true,
            message: "Performance report submitted successfully",
            report_id: report.id
        });

    } catch (err) {
        await t.rollback();

        console.error("Error submitting performance report:", err);

        res.status(500).json({
            success: false,
            message: "Failed to submit performance report",
            error: err.message
        });
    }
};

exports.getPerformanceReportIndividualsData = async (req, res) => {
    const reports = await EmployeePerformanceReport.findAll({
        include: [
            {
                model: User,
                as: "user",
                attributes: ["id"],
                include: [
                    {
                        model: Employee,
                        as: "employee"
                    }
                ]
            }
        ],
        order: [["createdAt", "DESC"]]
    });
    return res.status(200).json({
        message: `nice`,
        reports,
    });
}

exports.getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.findAll({
            where: {
                id: {
                    [Op.notIn]: [1, 3, 4, 5, 6, 7, 8, 9, 10, 17, 50, 51],
                },
            },
            order: [["id", "ASC"]],
            include: [
                {
                    model: Teacher,
                    as: "teachers",
                    attributes: ["id"],
                    required: false,
                    include: [
                        {
                            model: Employee,
                            as: "employee",
                            attributes: ["organization_id"],
                            required: true,
                        },
                    ],
                },
            ],
        });

        const formattedSubjects = subjects.map(subject => {
            const organizations = [
                ...new Set(
                    subject.teachers
                        ?.map(t => t.employee?.organization_id)
                        .filter(Boolean)
                ),
            ];

            return {
                id: subject.id,
                name: subject.name,
                category_id: subject.category_id,
                organizations,
            };
        });

        return res.status(200).json({
            message: "nice",
            subjects: formattedSubjects,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

exports.viewTrainers = async (req, res) => {
    try {
        const trainers = await Employee.findAll({
            attributes: [
                "id",
                "first_name",
                "middle_name",
                "last_name",
                "user_id",
                "organization_id",
            ],
            include: [
                {
                    model: Teacher,
                    as: "teacher",
                    required: true,
                    attributes: ["id", "subject_id"],
                },
            ],
            where: {
                organization_id: {
                    [Op.in]: [4, 5, 7, 8, 9],
                },
            },
        });

        res.status(200).json({
            status: "success",
            message: "data got fetched successfully",
            trainers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

exports.viewAllClasses = async (req, res) => {
    try {
        const classes = await Class.findAll({
            attributes: [
                "id",
                "name",
                "status",
                "createdAt"
            ],
            include: [
                {
                    model: Student,
                    as: "students",
                    required: true,
                    attributes: ["id", "school_id"],
                },
                {
                    model: Session,
                    as: "sessions",
                    required: true,
                    attributes: ["id"],
                    include: [
                        {
                            model: Teacher,
                            as: "teacher",
                            required: true,
                            attributes: ["id", "subject_id"],
                            include: [
                                {
                                    model: Employee,
                                    as: "employee",
                                    required: true,
                                    attributes: ["user_id"],
                                },
                            ],
                        },
                    ],
                },
            ],
            where: {
                id: {
                    [Op.notIn]: [1, 2, 3, 4, 5, 6, 7, 16, 17, 18, 19, 20],
                },
            },
        });

        const formattedClasses = classes.map(singleClass => {
            const organizations = [
                ...new Set(
                    singleClass.students
                        ?.map(t => t.school_id)
                        .filter(Boolean)
                ),
            ];

            const subject = [
                ...new Set(
                    singleClass.sessions
                        ?.map(t => t.teacher?.subject_id)
                        .filter(Boolean)
                ),
            ];

            const trainer_user_id = [
                ...new Set(
                    singleClass.sessions
                        ?.map(t => t.teacher?.employee?.user_id)
                        .filter(Boolean)
                ),
            ];

            return {
                id: singleClass.id,
                name: singleClass.name,
                status: singleClass.status,
                organization: organizations[0],
                trainer_user_id: trainer_user_id[0],
                subject: subject[0]
            };
        });

        res.status(200).json({
            status: "success",
            message: "data got fetched successfully",
            classes: formattedClasses,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

exports.getOrgsCurriculums = async (req, res) => {
    try {
        const curriculums = await watomsService.getWatomsOrgsCurriculumsData();

        res.status(200).json({
            status: "success",
            message: "curriculums got fetched successfully",
            curriculums
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getWatomsSubjects = async (req, res) => {
    try {
        const subjects = await watomsService.getWatomsSubjectsData();

        res.status(200).json({
            status: "success",
            message: "subjects got fetched successfully",
            subjects
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.insertTrainerRegistrationForm = async (req, res) => {
    try {
        const {
            firstName,
            secondName,
            thirdName,
            fourthName,
            birthDate,
            email,
            phoneNumber,
            whatsappNumber,
            city,
            certification,
            knownUs,
            notes,
            subjectId,
        } = req.body;

        // required fields
        if (!firstName || !secondName || !thirdName || !phoneNumber || !city || !subjectId) {
            return res.status(400).json({ status: "fail", message: "Missing required fields" });
        }

        // optional email validation
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ status: "fail", message: "Invalid email format" });
        }

        // store relative URL (recommended since you serve /uploads)
        const cvPath = req.file ? `/uploads/cvs/${req.file.filename}` : null;

        const data = {
            firstName,
            secondName,
            thirdName,
            fourthName: fourthName || null,
            birthDate: birthDate || null,
            email: email || null,
            phoneNumber,
            whatsappNumber: whatsappNumber || null,
            city,
            certification: certification || null,
            knownUs: knownUs || null,
            notes: notes || null,
            subjectId: Number(subjectId),
            cv: cvPath,
        };

        await watomsService.postWatomsTrainersRegistrationForm(data);

        return res.status(201).json({
            status: "success",
            message: "Form inserted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

exports.fetchWatomsCoursesDetails = async (req, res) => {
    try {
        const courses = await watomsService.getWatomsCoursesDetailedData();

        res.status(200).json({
            status: "success",
            message: "courses got fetched successfully",
            courses
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

exports.getCurriculumsOrgs = async (req, res) => {
    try {
        const curriculums = await watomsService.getWatomsCurriculumsOrgsData();

        res.status(200).json({
            status: "success",
            message: "curriculums got fetched successfully",
            curriculums
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.getSpecializations = async (req, res) => {
    try {
        const specializations = await watomsService.getSpecializationsData();

        res.status(200).json({
            status: "success",
            message: "specializations got fetched successfully",
            specializations
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.getClassRooms = async (req, res) => {
    try {
        const classrooms = await watomsService.getClassRoomsData();

        res.status(200).json({
            status: "success",
            message: "classrooms got fetched successfully",
            classrooms
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.getSystemSurvey = async (req, res) => {
    try {
        const survey = await watomsService.getSystemSurveyData();

        res.status(200).json({
            status: "success",
            message: "survey got fetched successfully",
            survey
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.submitWatomsSystemSurvey = async (req, res) => {
    try {
        const data = req.body;
        const survey = await watomsService.insertSystemSurveyData(data);

        res.status(200).json({
            status: "success",
            message: "survey got submitted successfully",
            survey
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};