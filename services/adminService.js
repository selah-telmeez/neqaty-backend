const wabysRepository = require("../repositories/wabysRepository");
const wisdomRepository = require("../repositories/wisdomRepository");

exports.createNewClassData = async (data) => {
    return await wabysRepository.insertNewClassData(data);
};

exports.editClassData = async (id, updateData) => {
    return await wabysRepository.updateClassRowData(id, updateData);
};

exports.deleteClassData = async (id) => {
    return await wabysRepository.deleteClassRowData(id);
};

exports.editClassRoomData = async (id, updateData) => {
    return await wabysRepository.updateClassRoomRowData(id, updateData);
};

exports.createNewClassRoomData = async (data) => {
    return await wabysRepository.insertNewClassRoomData(data);
};

exports.addClassRoomDocument = async (data, storedPath, decodedOriginal) => {
    const uploadedDocument = await wabysRepository.insertNewUploadData(storedPath);

    const classRoomDocument = await wisdomRepository.insertNewClassRoomDocument(data, uploadedDocument.id);

    return {
        classRoomDocument,
        filePath: storedPath,
        originalname: decodedOriginal,
    };
};