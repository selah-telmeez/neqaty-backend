const adminService = require('../services/adminService');

exports.createNewClass = async (req, res) => {
    try {
        const data = req.body;
        const newClass = await adminService.createNewClassData(data);

        res.status(200).json({
            status: "success",
            message: "class got added successfully",
            newClass
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.editClass = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedClass = await adminService.editClassData(id, updateData);

        if (!updatedClass) {
            return res.status(404).json({
                status: "fail",
                message: "Class not found",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Class updated successfully",
            data: updatedClass,
        });
    } catch (err) {
        console.error("Edit Class Error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.deleteClass = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedClass = await adminService.deleteClassData(id);

        // if service returns null when not found
        if (!deletedClass) {
            return res.status(404).json({
                status: "fail",
                message: "Class not found",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "class got deleted successfully",
            data: deletedClass,
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.editClassRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedClassRoom = await adminService.editClassRoomData(id, updateData);

        if (!updatedClassRoom) {
            return res.status(404).json({
                status: "fail",
                message: "ClassRoom not found",
            });
        }

        return res.status(200).json({
            status: "success",
            message: "ClassRoom updated successfully",
            data: updatedClassRoom,
        });
    } catch (err) {
        console.error("Edit Class Error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.createNewClassRoom = async (req, res) => {
    try {
        const data = req.body;
        const newClassRoom = await adminService.createNewClassRoomData(data);

        res.status(200).json({
            status: "success",
            message: "classroom got added successfully",
            newClassRoom
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.createNewOrganization = async (req, res) => {
    try {
        const data = req.body;
        const newClassRoom = await adminService.createNewClassRoomData(data);

        res.status(200).json({
            status: "success",
            message: "classroom got added successfully",
            newClassRoom
        });
    } catch (err) {
        console.error("error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err?.message,
        });
    }
};

exports.classroomUpload = async (req, res) => {
    try {
        const data = req.body;
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const storedPath = req.file.path.replace(/\\/g, "/");
        const decodedOriginal = Buffer.from(req.file.originalname, "latin1").toString("utf8");

        if (!data.user_id || !data.classroom_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const uploadedDocument = await adminService.addClassRoomDocument(data, storedPath, decodedOriginal);

        res.status(200).json({
            status: "success",
            message: "documnet got uploaded successfully",
            uploadedDocument
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
}

exports.userUploadImage = async (req, res) => {
    try {
        const data = req.body;
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const storedPath = req.file.path.replace(/\\/g, "/");
        const decodedOriginal = Buffer.from(req.file.originalname, "latin1").toString("utf8");

        if (!data.user_id) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const uploadedImage = await adminService.addUserImage(data, storedPath, decodedOriginal);

        res.status(200).json({
            status: "success",
            message: "image got uploaded successfully",
            uploadedImage
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
}

exports.assignTeacherClass = async (req, res) => {
    try {
        const { teacher_id, class_ids } = req.body;

        if (!teacher_id || !Array.isArray(class_ids)) {
            return res.status(400).json({ error: "teacher_id and class_ids (array) are required" });
        }

        const sessions = await adminService.assignTeacherClassData(teacher_id, class_ids);

        res.status(200).json({
            status: "success",
            message: "teacher's classes got assigned successfully",
            sessions
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
}

exports.getUserRolesPermissions = async (req, res) => {
    try {

        const roles = await adminService.fetchUserRolesPermissions();

        res.status(200).json({
            status: "success",
            message: "roles got fetched successfully",
            roles
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
}

exports.updateRolePermissions = async (req, res) => {
    try {
        const { user_role_id, page_ids } = req.body;

        if (!user_role_id || !Array.isArray(page_ids)) {
            return res.status(400).json({ error: "role_id and page_ids (array) are required" });
        }

        const permissions = await adminService.syncRolePermissions(user_role_id, page_ids);

        res.status(200).json({
            status: "success",
            message: "role permissions got updated successfully",
            permissions
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error" });
    }
}