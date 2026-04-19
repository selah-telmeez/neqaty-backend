const wabysRepository = require("../repositories/wabysRepository");

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