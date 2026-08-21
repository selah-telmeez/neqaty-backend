const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");

// New APIs
router.get("/authorities", dataController.fetchAuthorities);
router.get("/pages", dataController.fetchPagesInfo);
router.get("/employee-details/:id", dataController.fetchEmployeeDetails);
router.patch("/employee-details/:id", dataController.updateEmployeeDetails);

router.get("/students/specializations", dataController.specializations);
router.get("/orgs/check", dataController.projects);
router.get("/traineesRegistrations", dataController.fetchTraineesRegistrations);
router.get("/employees/roles", dataController.fetchEmployeesRoles);
router.get("/projects", dataController.fetchProjects);
router.get("/programs", dataController.fetchPrograms);
router.get("/orgs", dataController.fetchOrgs);
router.get("/education-centers/:system", dataController.fetchEducationCenters);

module.exports = router;