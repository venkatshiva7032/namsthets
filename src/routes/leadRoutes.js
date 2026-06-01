const express = require("express");
const router  = express.Router();
const {
  getLeads,
  getKanbanLeads,
  getStats,
  getLead,
  createLead,
  updateLead,
  updateStage,
  deleteLead,
  getMeta,
} = require("../controllers/leadController");

// ── Meta & aggregated routes (must come BEFORE /:id routes) ──
router.get("/meta",   getMeta);         // GET  /api/leads/meta
router.get("/stats",  getStats);        // GET  /api/leads/stats
router.get("/kanban", getKanbanLeads);  // GET  /api/leads/kanban

// ── Collection routes ─────────────────────────────────────────
router.route("/")
  .get(getLeads)      // GET  /api/leads  (+ query params)
  .post(createLead);  // POST /api/leads

// ── Document routes ───────────────────────────────────────────
router.route("/:id")
  .get(getLead)       // GET    /api/leads/:id
  .patch(updateLead)  // PATCH  /api/leads/:id
  .delete(deleteLead);// DELETE /api/leads/:id

router.patch("/:id/stage", updateStage); // PATCH /api/leads/:id/stage

module.exports = router;
