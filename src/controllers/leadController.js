const Lead = require("../models/Lead");
const { DEAL_STAGES, SERVICE_TYPES, TIMELINES } = require("../models/Lead");

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all leads (with filtering, sorting, pagination)
// @route   GET /api/leads
// @access  Public (add auth middleware later)
// ─────────────────────────────────────────────────────────────
exports.getLeads = async (req, res, next) => {
  try {
    const {
      stage,         // filter by deal stage
      service,       // filter by service type
      priority,      // filter by priority
      search,        // full-text search
      sortBy = "createdAt",
      order  = "desc",
      page   = 1,
      limit  = 20,
      followUpToday, // "true" → only leads with follow-up today
    } = req.query;

    const filter = {};

    if (stage)    filter.dealStage    = stage;
    if (service)  filter.serviceType  = service;
    if (priority) filter.priority     = priority;

    // Follow-ups due today
    if (followUpToday === "true") {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end   = new Date(); end.setHours(23, 59, 59, 999);
      filter.followUpDate = { $gte: start, $lte: end };
    }

    // Full-text search across name, company, enquiry
    if (search) {
      filter.$text = { $search: search };
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const skip = (Number(page) - 1) * Number(limit);

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .select("-activityLog"), // Omit heavy log from list view
      Lead.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: leads,
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get leads grouped by deal stage (for Kanban)
// @route   GET /api/leads/kanban
// ─────────────────────────────────────────────────────────────
exports.getKanbanLeads = async (req, res, next) => {
  try {
    const leads = await Lead.find()
      .sort({ createdAt: -1 })
      .select("-activityLog");

    // Group into a map keyed by stage, preserving stage order
    const kanban = DEAL_STAGES.reduce((acc, stage) => {
      acc[stage] = leads.filter((l) => l.dealStage === stage);
      return acc;
    }, {});

    res.status(200).json({ success: true, data: kanban });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get dashboard summary stats
// @route   GET /api/leads/stats
// ─────────────────────────────────────────────────────────────
exports.getStats = async (req, res, next) => {
  try {
    const { start, end } = getTodayRange();

    const [stageCounts, followUpsTodayCount, totalLeads, followUpsToday] = await Promise.all([
      Lead.aggregate([
        { $group: { _id: "$dealStage", count: { $sum: 1 } } },
      ]),
      Lead.countDocuments({ followUpDate: { $gte: start, $lte: end } }),
      Lead.countDocuments(),
      Lead.find({ followUpDate: { $gte: start, $lte: end } })
        .select("name company email dealStage followUpDate priority")
        .sort({ followUpDate: 1 }),
    ]);

    const byStage = DEAL_STAGES.reduce((acc, s) => {
      acc[s] = 0;
      return acc;
    }, {});
    stageCounts.forEach(({ _id, count }) => {
      if (_id) {
        byStage[_id] = count;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalLeads,
        byStage,
        followUpsTodayCount,
        followUpsToday,
        closedWon: byStage["Closed Won"],
        closedLost: byStage["Closed Lost"],
        activeLeads: totalLeads - byStage["Closed Won"] - byStage["Closed Lost"],
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get single lead (full detail with activity log)
// @route   GET /api/leads/:id
// ─────────────────────────────────────────────────────────────
exports.getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found." });
    }
    res.status(200).json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Create a new lead
// @route   POST /api/leads
// ─────────────────────────────────────────────────────────────
exports.createLead = async (req, res, next) => {
  try {
    const lead = await Lead.create(req.body);

    // Log initial creation in the activity log
    lead.activityLog.push({
      type: "note",
      description: `Lead created with stage "${lead.dealStage}"`,
      newValue: lead.dealStage,
    });
    await lead.save();

    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update a lead (partial update via PATCH)
// @route   PATCH /api/leads/:id
// ─────────────────────────────────────────────────────────────
exports.updateLead = async (req, res, next) => {
  try {
    // Fetch existing so we can capture previous stage for the log
    const existing = await Lead.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, error: "Lead not found." });
    }

    // Store previous stage for the pre-save middleware
    existing.$locals.previousStage = existing.dealStage;

    // Apply updates
    Object.assign(existing, req.body);

    // If a manual note was passed in the request, append it
    if (req.body.newNote) {
      existing.activityLog.push({
        type: "note",
        description: req.body.newNote,
      });
    }

    await existing.save();
    res.status(200).json({ success: true, data: existing });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update only the deal stage (used by Kanban drag-drop)
// @route   PATCH /api/leads/:id/stage
// ─────────────────────────────────────────────────────────────
exports.updateStage = async (req, res, next) => {
  try {
    const { dealStage } = req.body;
    if (!DEAL_STAGES.includes(dealStage)) {
      return res.status(400).json({ success: false, error: "Invalid deal stage." });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found." });
    }

    lead.$locals.previousStage = lead.dealStage; // triggers activity log in pre-save
    lead.dealStage = dealStage;
    await lead.save();

    res.status(200).json({ success: true, data: lead });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete a lead
// @route   DELETE /api/leads/:id
// ─────────────────────────────────────────────────────────────
exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found." });
    }
    res.status(200).json({ success: true, message: "Lead deleted successfully." });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Return enum values (for frontend dropdowns)
// @route   GET /api/leads/meta
// ─────────────────────────────────────────────────────────────
exports.getMeta = async (req, res) => {
  res.status(200).json({
    success: true,
    data: { DEAL_STAGES, SERVICE_TYPES, TIMELINES },
  });
};