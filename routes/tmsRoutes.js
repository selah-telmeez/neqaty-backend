const express = require("express");
const router = express.Router();
const tmsController = require("../controllers/tmsController");

router.get("/my/tasks/:id/:system", tmsController.allMyTasks);
// api for tms dashboard page
// router.get("/dashboard/:system", tmsController.tmsDashboardold);
router.get("/dashboard", tmsController.tmsDashboard);

module.exports = router;