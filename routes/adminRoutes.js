const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.post("/create-new-class", adminController.createNewClass);
router.patch("/edit-class/:id", adminController.editClass);
router.delete("/delete-class/:id", adminController.deleteClass);
router.patch("/edit-classroom/:id", adminController.editClass);
router.post("/create-new-classroom", adminController.createNewClassRoom);
router.post("/create-new-organization", adminController.createNewOrganization);

module.exports = router;