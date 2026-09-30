const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");

router.get("/authorities", dataController.fetchAuthorities);
router.get("/employees/roles", dataController.fetchEmployeesRoles);

module.exports = router;
