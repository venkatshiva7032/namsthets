const mongoose = require('mongoose');

const DEAL_STAGES = [
  'New',
  'Contacted',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
];

const SERVICE_TYPES = [
  'Consulting',
  'Implementation',
  'Support',
  'Training',
];

const PRIORITY_LEVELS = ['Low', 'Medium', 'High', 'Urgent'];

const TIMELINES = [
  'Today',
  'This Week',
  'Next Week',
  'This Month',
  'Next Month',
  'Undecided',
];

const activityEntrySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['note', 'stage-change', 'update', 'follow-up'],
    default: 'note',
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  oldValue: {
    type: String,
    trim: true,
  },
  newValue: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lead name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  source: {
    type: String,
    trim: true,
  },
  serviceType: {
    type: String,
    enum: SERVICE_TYPES,
  },
  priority: {
    type: String,
    enum: PRIORITY_LEVELS,
    default: 'Medium',
  },
  dealStage: {
    type: String,
    enum: DEAL_STAGES,
    default: 'New',
  },
  followUpDate: {
    type: Date,
  },
  timeline: {
    type: String,
    enum: TIMELINES,
  },
  enquiry: {
    type: String,
    trim: true,
  },
  activityLog: {
    type: [activityEntrySchema],
    default: [],
  },
}, {
  timestamps: true,
});

leadSchema.index({
  name: 'text',
  company: 'text',
  email: 'text',
  enquiry: 'text',
  source: 'text',
});

leadSchema.pre('save', function (next) {
  if (!this.isNew && this.$locals && this.$locals.previousStage && this.$locals.previousStage !== this.dealStage) {
    this.activityLog.push({
      type: 'stage-change',
      description: `Deal stage changed from ${this.$locals.previousStage} to ${this.dealStage}`,
      oldValue: this.$locals.previousStage,
      newValue: this.dealStage,
    });
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema);
module.exports.DEAL_STAGES = DEAL_STAGES;
module.exports.SERVICE_TYPES = SERVICE_TYPES;
module.exports.PRIORITY_LEVELS = PRIORITY_LEVELS;
module.exports.TIMELINES = TIMELINES;
