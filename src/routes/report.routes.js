const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");
const reportValidator = require("../validators/report.validator");
const upload = require("../middlewares/upload.middleware");
const authenticate = require("../middlewares/auth.middleware");

router.post(
  "/",
  authenticate,
  upload.single("evidence_files"),
  reportValidator.createReportValidator,
  reportController.createReport
);

router.get("/history", authenticate, reportController.getReportHistory);

router.get("/:id", authenticate, reportController.getReportDetail);

router.get(
  "/anonymous/:unique_code",
  reportController.getAnonymousReportDetail
);

router.put("/:id/process", authenticate, reportController.processReport);

router.put("/:id/reject", authenticate, reportController.rejectReport);

router.put(
  "/:id/complete",
  authenticate,
  upload.single("handling_proof"),
  reportController.completeReport
);

module.exports = router;
