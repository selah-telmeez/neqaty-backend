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