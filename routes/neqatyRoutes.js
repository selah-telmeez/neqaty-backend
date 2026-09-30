const express = require("express");
const router = express.Router();
const neqatyController = require("../controllers/neqatyController");

router.get("/vtcPoints", neqatyController.viewVtcPoints);
router.post("/vtcPoints", neqatyController.createVtcPoint);
router.put("/vtcPoints/:id", neqatyController.updateVtcPoint);
router.delete("/vtcPoints/:id", neqatyController.deleteVtcPoint);
router.post("/updatePoints", neqatyController.updatePoints);
router.get("/permissions", neqatyController.viewPointsPermissions);
router.patch("/grantPointsRequests", neqatyController.PointRequestStatus);
router.post("/userPoints", neqatyController.viewUserPoints);
router.get("/watoms/monthly/performance", neqatyController.watomsMonthlyPerformance);
router.get("/monthly/performance/:id", neqatyController.employeeMonthlyPerformance);
router.get("/admin/signup-options", neqatyController.signupOptions);
router.post("/admin/users", neqatyController.createUser);
router.post("/admin/organizations", neqatyController.createOrganization);
router.get("/profile/:id", neqatyController.userProfile);
router.get("/logo", neqatyController.getLogo);
router.get("/logo/image", neqatyController.getLogoImage);
router.post("/admin/logo", neqatyController.uploadLogo);
router.delete("/admin/logo", neqatyController.resetLogo);

module.exports = router;
