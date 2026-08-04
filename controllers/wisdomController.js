const wisdomService = require('../services/wisdomService');

exports.fetchWisdomDashboard = async (req, res) => {
    try {
        const year = Number(req.params.year);
        const stage = req.params.stage;
        const subject = req.params.subject;
        const specialization = req.params.specialization;
        const fromDate = req.params.from;
        const toDate = req.params.to;
        const dashboard = await wisdomService.getWisdomDashboardData(year, stage, subject, specialization, fromDate, toDate);

        res.status(200).json({
            status: "success",
            message: "dashboard got fetched successfully",
            dashboard
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchWisdomDashboardGeneralInformation = async (req, res) => {
    try {
        const generalInfo = await wisdomService.getWisdomDashboardGeneralInfoData();

        res.status(200).json({
            status: "success",
            message: "dashboard general info got fetched successfully",
            generalInfo
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchWisdomRelatedSchools = async (req, res) => {
    try {
        const schools = await wisdomService.getWisdomRelatedSchoolsData();

        res.status(200).json({
            status: "success",
            message: "schools data got fetched successfully",
            schools
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchWisdomStages = async (req, res) => {
    try {
        const stages = await wisdomService.getWisdomStagesData();

        res.status(200).json({
            status: "success",
            message: "stages got fetched successfully",
            stages
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchWisdomSubjects = async (req, res) => {
    try {
        const subjects = await wisdomService.getWisdomSubjectsData();

        res.status(200).json({
            status: "success",
            message: "subjects got fetched successfully",
            subjects
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchWisdomSpecializations = async (req, res) => {
    try {
        const specializations = await wisdomService.getWisdomSpecializationsData();

        res.status(200).json({
            status: "success",
            message: "specializations got fetched successfully",
            specializations
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.fetchWisdomForms = async (req, res) => {
    try {
        const forms = await wisdomService.getWisdomFormsData();

        res.status(200).json({
            status: "success",
            message: "forms got fetched successfully",
            forms
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.createNewGradeBook = async (req, res) => {
    try {
        await wisdomService.postWisdomCreateGradebookData(req.body);

        res.status(200).json({
            status: "success",
            message: "grade book got created successfully",
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.GetGradeBooks = async (req, res) => {
    try {
        const gradebooks = await wisdomService.getWisdomGradebooksData();

        res.status(200).json({
            status: "success",
            message: "grade books got fetched successfully",
            gradebooks
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.insertGradeBookScore = async (req, res) => {
    try {
        await wisdomService.postWisdomInsertGradebookData(req.body);

        res.status(200).json({
            status: "success",
            message: "grade book got inserted successfully",
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.insertTeacherAbsence = async (req, res) => {
    try {
        await wisdomService.postWisdomInsertTeacherAbsenceData(req.body);

        res.status(200).json({
            status: "success",
            message: "teacher absence got inserted successfully",
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

exports.getStudents = async (req, res) => {
    try {
        const students = await wisdomService.getWisdomStudentsData();

        res.status(200).json({
            status: "success",
            message: "students got fetched successfully",
            students
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.getTeachers = async (req, res) => {
    try {
        const teachers = await wisdomService.getWisdomTeachersData();

        res.status(200).json({
            status: "success",
            message: "teachers got fetched successfully",
            teachers
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
        const classrooms = await wisdomService.getClassRoomsData();

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

exports.getSpecializations = async (req, res) => {
    try {
        const specializations = await wisdomService.getSpecializationsData();

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

exports.getSubjects = async (req, res) => {
    try {
        const subjects = await wisdomService.getSubjectsData();

        res.status(200).json({
            status: "success",
            message: "subjects got fetched successfully",
            subjects
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.getClasses = async (req, res) => {
    try {
        const classes = await wisdomService.getClassesData();

        res.status(200).json({
            status: "success",
            message: "classes got fetched successfully",
            classes
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.getDepartment = async (req, res) => {
    try {
        const departments = await wisdomService.getDepartmentsData();

        res.status(200).json({
            status: "success",
            message: "departments got fetched successfully",
            departments
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.getGradebookScores = async (req, res) => {
    try {
        const id = req.params.template_id;
        const gradebooks = await wisdomService.getGradeBooksScoresData(id);

        res.status(200).json({
            status: "success",
            message: "gradebooks got fetched successfully",
            gradebooks
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.getRelatedOrgs = async (req, res) => {
    try {
        const organizations = await wisdomService.getWisdomOrganizationsData();

        res.status(200).json({
            status: "success",
            message: "organizations got fetched successfully",
            organizations
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.getTeacherEmployeeDepartments = async (req, res) => {
    try {
        const departments = await wisdomService.getWisdomTeacherEmployeeDepartmentsData();

        res.status(200).json({
            status: "success",
            message: "departments got fetched successfully",
            departments
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.getClassRoomDetails = async (req, res) => {
    try {
        const id = req.params.id;
        const classroomDetails = await wisdomService.getClassRoomDetailsData(id);

        res.status(200).json({
            status: "success",
            message: "classroom details got fetched successfully",
            classroomDetails
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.fetchWisdomTeacherDashboard = async (req, res) => {
    try {
        const orgId = req.params.orgId;
        const dashboard = await wisdomService.getTeachersDashboard(orgId);

        res.status(200).json({
            status: "success",
            message: "teachers dashboard got fetched successfully",
            dashboard
        })
    } catch (error) {
        console.error("Teacher Dashboard Error:", error);

        res.status(500).json({
            message: "Teacher Dashboard Error",
            error: error.message,
            stack: error.stack,
        });
    }
}

exports.fetchClassRoomUploads = async (req, res) => {
    try {
        const classroomId = req.params.classroom_id;
        const uploads = await wisdomService.getClassRoomUploadsData(classroomId);

        res.status(200).json({
            status: "success",
            message: "classroom uploads got fetched successfully",
            uploads
        })
    } catch (error) {
        console.error("ClassRooom Uploads Error:", error);

        res.status(500).json({
            message: "ClassRooom Uploads Error",
            error: error.message,
            stack: error.stack,
        });
    }
}

exports.fetchUserImage = async (req, res) => {
    try {
        const userId = req.params.user_id;
        const image = await wisdomService.getUserImageData(userId);

        res.status(200).json({
            status: "success",
            message: "user image got fetched successfully",
            image
        })
    } catch (error) {
        console.error("User Image Error:", error);

        res.status(500).json({
            message: "User Image Error",
            error: error.message,
            stack: error.stack,
        });
    }
};

exports.fetchTeacherClasses = async (req, res) => {
    try {
        const teacher_id = req.params.teacher_id;
        const classes = await wisdomService.getTeacherClassesData(teacher_id);

        res.status(200).json({
            status: "success",
            message: "classes got fetched successfully",
            classes
        })
    } catch (error) {
        console.error("Teacher Classes Error:", error);

        res.status(500).json({
            message: "Teacher Classes Error",
            error: error.message,
            stack: error.stack,
        });
    }
};