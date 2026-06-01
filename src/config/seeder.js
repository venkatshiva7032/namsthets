const Lead = require("../models/Lead");

const mockLeads = [
  {
    name: "Rajesh Kumar",
    email: "rajesh@innovate-tech.in",
    phone: "+91 98765 43210",
    company: "InnovateTech Solutions",
    source: "LinkedIn Outreach",
    serviceType: "Consulting",
    priority: "High",
    dealStage: "New",
    timeline: "This Week",
    followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 2), // in 2 hours
    enquiry: "Interested in technical architecture review and scalability consulting for our legacy backend systems.",
  },
  {
    name: "Sarah Jenkins",
    email: "sarah.jenkins@vertexcorp.com",
    phone: "+1 (415) 555-2671",
    company: "Vertex Corp",
    source: "Google Search",
    serviceType: "Implementation",
    priority: "Urgent",
    dealStage: "Proposal",
    timeline: "Today",
    followUpDate: new Date(), // Today
    enquiry: "Need end-to-end integration support for migrating our CRM pipelines. Looking for a team of 4 senior engineers.",
  },
  {
    name: "Amit Patel",
    email: "amit.patel@growthmedia.co",
    phone: "+91 87654 32109",
    company: "Growth Media",
    source: "Webinar",
    serviceType: "Training",
    priority: "Medium",
    dealStage: "Contacted",
    timeline: "Next Week",
    followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // in 2 days
    enquiry: "Interested in onboarding and training programs for our fresh hire engineering batch.",
  },
  {
    name: "Elena Rostova",
    email: "elena@nordicconsulting.se",
    phone: "+46 8 123 45 67",
    company: "Nordic Consulting Group",
    source: "Cold Email",
    serviceType: "Support",
    priority: "Low",
    dealStage: "Qualified",
    timeline: "This Month",
    followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // in 5 days
    enquiry: "Looking for long-term L2/L3 application maintenance and production support services.",
  },
  {
    name: "Vikram Malhotra",
    email: "v.malhotra@indialogistics.com",
    phone: "+91 99887 76655",
    company: "India Logistics Ltd",
    source: "Referral",
    serviceType: "Implementation",
    priority: "High",
    dealStage: "Negotiation",
    timeline: "This Week",
    followUpDate: new Date(), // Today
    enquiry: "Negotiating service level agreements (SLAs) for warehouse management system implementation.",
  },
  {
    name: "Chloe Chen",
    email: "chloe.chen@nexusexports.hk",
    phone: "+852 2345 6789",
    company: "Nexus Global Exports",
    source: "Google Search",
    serviceType: "Consulting",
    priority: "Medium",
    dealStage: "Closed Won",
    timeline: "Today",
    followUpDate: null,
    enquiry: "Successfully signed the advisory agreement for business operations scaling.",
  },
  {
    name: "Marcus Aurelius",
    email: "marcus.a@stoiclead.com",
    phone: "+39 06 123456",
    company: "Stoic Lead Agency",
    source: "LinkedIn Outreach",
    serviceType: "Support",
    priority: "High",
    dealStage: "Closed Lost",
    timeline: "Undecided",
    followUpDate: null,
    enquiry: "Competitor bid was 20% lower. Lead closed as lost due to price constraints.",
  }
];

const seedDB = async () => {
  try {
    const count = await Lead.countDocuments();
    if (count === 0) {
      console.log("🌱 Database is empty. Seeding mock CRM leads...");
      for (const leadData of mockLeads) {
        const lead = await Lead.create(leadData);
        // Log initial creation
        lead.activityLog.push({
          type: "note",
          description: `Lead created with stage "${lead.dealStage}" via DB Seeder`,
          newValue: lead.dealStage,
        });
        await lead.save();
      }
      console.log(`✅ Seeded ${mockLeads.length} mock leads successfully!`);
    } else {
      console.log(`ℹ️ Database already has ${count} records. Skipping seeding.`);
    }
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
};

module.exports = seedDB;
