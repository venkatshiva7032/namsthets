// ── State Management ──────────────────────────────────────────
const state = {
  activeTab: 'dashboard',
  meta: {
    DEAL_STAGES: [],
    SERVICE_TYPES: [],
    TIMELINES: []
  },
  directory: {
    leads: [],
    search: '',
    stage: '',
    service: '',
    priority: '',
    followUpToday: false,
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
    limit: 10,
    totalPages: 1,
    totalCount: 0
  },
  charts: {
    pipeline: null,
    priority: null
  }
};

// ── DOM Elements ──────────────────────────────────────────────
const el = {
  navItems: document.querySelectorAll('.nav-item'),
  tabContents: document.querySelectorAll('.tab-content'),
  pageTitle: document.getElementById('page-title'),
  pageSubtitle: document.getElementById('page-subtitle'),
  
  // Dashboard KPI
  statTotalLeads: document.getElementById('stat-total-leads'),
  statActiveLeads: document.getElementById('stat-active-leads'),
  statClosedWon: document.getElementById('stat-closed-won'),
  statFollowupsToday: document.getElementById('stat-followups-today'),
  
  // Dashboard lists
  agendaList: document.getElementById('dashboard-agenda-list'),
  operationsList: document.getElementById('dashboard-operations-list'),
  
  // Kanban Container
  kanbanContainer: document.getElementById('kanban-board-container'),
  
  // Leads Directory Table
  leadsTableBody: document.getElementById('leads-table-body'),
  searchInput: document.getElementById('leads-search-input'),
  filterStage: document.getElementById('filter-stage'),
  filterService: document.getElementById('filter-service'),
  filterPriority: document.getElementById('filter-priority'),
  filterFollowupToday: document.getElementById('filter-followup-today'),
  btnPrevPage: document.getElementById('btn-prev-page'),
  btnNextPage: document.getElementById('btn-next-page'),
  currentPageNum: document.getElementById('current-page-num'),
  paginationInfoText: document.getElementById('pagination-info-text'),
  
  // Add/Edit Form Modal
  modalLeadForm: document.getElementById('modal-lead-form'),
  leadEditForm: document.getElementById('lead-edit-form'),
  leadModalTitle: document.getElementById('lead-modal-title'),
  formLeadId: document.getElementById('form-lead-id'),
  btnAddLeadTop: document.getElementById('btn-add-lead-top'),
  btnCancelFormModal: document.getElementById('btn-cancel-form-modal'),
  btnCloseFormModal: document.getElementById('btn-close-form-modal'),
  
  // Inputs in Form Modal
  formName: document.getElementById('form-name'),
  formCompany: document.getElementById('form-company'),
  formEmail: document.getElementById('form-email'),
  formPhone: document.getElementById('form-phone'),
  formService: document.getElementById('form-service'),
  formPriority: document.getElementById('form-priority'),
  formStage: document.getElementById('form-stage'),
  formSource: document.getElementById('form-source'),
  formTimeline: document.getElementById('form-timeline'),
  formFollowup: document.getElementById('form-followup'),
  formEnquiry: document.getElementById('form-enquiry'),
  
  // Detail Modal
  modalLeadDetail: document.getElementById('modal-lead-detail'),
  btnCloseDetailModal: document.getElementById('btn-close-detail-modal'),
  detailLeadName: document.getElementById('detail-lead-name'),
  detailLeadPriority: document.getElementById('detail-lead-priority'),
  detailLeadStage: document.getElementById('detail-lead-stage'),
  detailCompany: document.getElementById('detail-company'),
  detailEmail: document.getElementById('detail-email'),
  detailPhone: document.getElementById('detail-phone'),
  detailService: document.getElementById('detail-service'),
  detailSource: document.getElementById('detail-source'),
  detailTimeline: document.getElementById('detail-timeline'),
  detailFollowup: document.getElementById('detail-followup'),
  detailEnquiry: document.getElementById('detail-enquiry'),
  detailActivityLog: document.getElementById('detail-activity-log'),
  addNoteForm: document.getElementById('add-note-form'),
  formNoteText: document.getElementById('form-note-text')
};

// ── Formatting Utilities ──────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + 'y ago';
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + 'mo ago';
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + 'd ago';
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + 'h ago';
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + 'm ago';
  return 'just now';
};

// ── API Interactions ──────────────────────────────────────────
const api = {
  async getMeta() {
    const res = await fetch('/api/leads/meta');
    return res.json();
  },
  async getStats() {
    const res = await fetch('/api/leads/stats');
    return res.json();
  },
  async getLeads(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await fetch(`/api/leads?${query.toString()}`);
    return res.json();
  },
  async getKanban() {
    const res = await fetch('/api/leads/kanban');
    return res.json();
  },
  async getLead(id) {
    const res = await fetch(`/api/leads/${id}`);
    return res.json();
  },
  async createLead(data) {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateLead(id, data) {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async updateStage(id, stage) {
    const res = await fetch(`/api/leads/${id}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dealStage: stage })
    });
    return res.json();
  },
  async deleteLead(id) {
    const res = await fetch(`/api/leads/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};

// ── Tab Management ────────────────────────────────────────────
const switchTab = (tabName) => {
  state.activeTab = tabName;
  
  // Update nav buttons CSS
  el.navItems.forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update visible containers
  el.tabContents.forEach(content => {
    if (content.id === `tab-${tabName}`) {
      content.classList.add('active');
    } else {
      content.classList.remove('active');
    }
  });

  // Set headings text
  if (tabName === 'dashboard') {
    el.pageTitle.textContent = 'Executive Dashboard';
    el.pageSubtitle.textContent = 'Real-time performance metrics and lead acquisition pipeline';
    loadDashboardData();
  } else if (tabName === 'kanban') {
    el.pageTitle.textContent = 'Deals Pipeline';
    el.pageSubtitle.textContent = 'Track and update deal progression across pipeline stages';
    loadKanbanData();
  } else if (tabName === 'leads') {
    el.pageTitle.textContent = 'Leads Directory';
    el.pageSubtitle.textContent = 'Full access pipeline registry with deep analytics and searching';
    loadDirectoryData();
  }
};

// ── Initializing Metadata ─────────────────────────────────────
const initMetaOptions = async () => {
  try {
    const metaRes = await api.getMeta();
    if (metaRes.success) {
      state.meta = metaRes.data;
      
      // Populate filters & forms options
      el.filterStage.innerHTML = '<option value="">All Stages</option>';
      state.meta.DEAL_STAGES.forEach(stage => {
        el.filterStage.innerHTML += `<option value="${stage}">${stage}</option>`;
      });

      el.filterService.innerHTML = '<option value="">All Services</option>';
      state.meta.SERVICE_TYPES.forEach(service => {
        el.filterService.innerHTML += `<option value="${service}">${service}</option>`;
      });

      // Form Selects
      el.formStage.innerHTML = '';
      state.meta.DEAL_STAGES.forEach(stage => {
        el.formStage.innerHTML += `<option value="${stage}">${stage}</option>`;
      });

      el.formService.innerHTML = '';
      state.meta.SERVICE_TYPES.forEach(service => {
        el.formService.innerHTML += `<option value="${service}">${service}</option>`;
      });

      el.formTimeline.innerHTML = '<option value="">Undecided</option>';
      state.meta.TIMELINES.forEach(tl => {
        el.formTimeline.innerHTML += `<option value="${tl}">${tl}</option>`;
      });
    }
  } catch (err) {
    console.error('Failed to fetch metadata:', err);
  }
};

// ── Render Charts ─────────────────────────────────────────────
const renderDashboardCharts = (stats) => {
  const byStage = stats.byStage;
  const stages = Object.keys(byStage);
  const stageCounts = Object.values(byStage);

  // 1. Pipeline Stage Distribution (Doughnut Chart)
  if (state.charts.pipeline) {
    state.charts.pipeline.destroy();
  }
  const pipelineCtx = document.getElementById('pipelineChart').getContext('2d');
  state.charts.pipeline = new Chart(pipelineCtx, {
    type: 'doughnut',
    data: {
      labels: stages,
      datasets: [{
        data: stageCounts,
        backgroundColor: [
          '#3b82f6', // New
          '#8b5cf6', // Contacted
          '#ec4899', // Qualified
          '#f59e0b', // Proposal
          '#10b981', // Negotiation
          '#059669', // Closed Won
          '#dc2626'  // Closed Lost
        ],
        borderWidth: 2,
        borderColor: '#111827'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { color: '#f1f5f9', font: { family: 'Plus Jakarta Sans', size: 11 } }
        }
      },
      cutout: '65%'
    }
  });

  // 2. Priority Distribution Chart (Bar)
  // Let's count priorities from directory or display stats. Since stats endpoint doesn't have priorities directly, 
  // we will fetch all leads dynamically or run a small stats aggregation inside frontend
  api.getLeads({ limit: 100 }).then(leadsRes => {
    if (leadsRes.success) {
      const leads = leadsRes.data;
      const prioCounts = { Low: 0, Medium: 0, High: 0, Urgent: 0 };
      leads.forEach(l => {
        if (prioCounts[l.priority] !== undefined) prioCounts[l.priority]++;
      });

      if (state.charts.priority) {
        state.charts.priority.destroy();
      }
      const priorityCtx = document.getElementById('priorityChart').getContext('2d');
      state.charts.priority = new Chart(priorityCtx, {
        type: 'bar',
        data: {
          labels: ['Low', 'Medium', 'High', 'Urgent'],
          datasets: [{
            label: 'Leads count',
            data: [prioCounts.Low, prioCounts.Medium, prioCounts.High, prioCounts.Urgent],
            backgroundColor: [
              'rgba(148, 163, 184, 0.4)', // Low
              'rgba(99, 102, 241, 0.5)',  // Medium
              'rgba(245, 158, 11, 0.5)',  // High
              'rgba(239, 68, 68, 0.5)'    // Urgent
            ],
            borderColor: [
              '#94a3b8',
              '#818cf8',
              '#fbbf24',
              '#f87171'
            ],
            borderWidth: 1.5,
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' }, precision: 0 }
            },
            x: {
              grid: { display: false },
              ticks: { color: '#94a3b8', font: { family: 'Plus Jakarta Sans' } }
            }
          }
        }
      });
    }
  });
};

// ── Tab 1: Load Dashboard View ───────────────────────────────
const loadDashboardData = async () => {
  try {
    const statsRes = await api.getStats();
    if (statsRes.success) {
      const stats = statsRes.data;
      
      // Update KPI indicators
      el.statTotalLeads.textContent = stats.totalLeads;
      el.statActiveLeads.textContent = stats.activeLeads;
      el.statClosedWon.textContent = stats.closedWon;
      el.statFollowupsToday.textContent = stats.followUpsTodayCount;
      
      // Render Charts
      renderDashboardCharts(stats);

      // Render Today's Agenda
      el.agendaList.innerHTML = '';
      if (stats.followUpsToday && stats.followUpsToday.length > 0) {
        stats.followUpsToday.forEach(lead => {
          const bulletColor = lead.priority === 'Urgent' ? '#ef4444' : (lead.priority === 'High' ? '#f59e0b' : '#3b82f6');
          el.agendaList.innerHTML += `
            <div class="agenda-item" onclick="openDetailModal('${lead._id}')">
              <div class="agenda-left">
                <span class="agenda-bullet" style="background-color: ${bulletColor}"></span>
                <div class="agenda-info">
                  <span class="agenda-name">${lead.name}</span>
                  <span class="agenda-meta">${lead.company || 'No Company'} • Stage: ${lead.dealStage}</span>
                </div>
              </div>
              <div class="agenda-right">
                <span class="badge priority-badge prio-${lead.priority}">${lead.priority}</span>
              </div>
            </div>
          `;
        });
      } else {
        el.agendaList.innerHTML = '<div class="loading-placeholder">No follow-ups scheduled for today. Great job!</div>';
      }

      // Populate operations feed monitor (Fetching active timeline logs from recent leads)
      const recentLeadsRes = await api.getLeads({ limit: 15, sortBy: 'updatedAt', order: 'desc' });
      if (recentLeadsRes.success) {
        el.operationsList.innerHTML = '';
        
        // Let's retrieve activity entries across these leads
        let allActivities = [];
        recentLeadsRes.data.forEach(lead => {
          // Since getLeads excludes activityLog, let's fetch individual logs or render update timestamps 
          // Let's create beautiful operational logs dynamically using the lead metadata
          allActivities.push({
            leadId: lead._id,
            name: lead.name,
            company: lead.company,
            text: `Lead registered under <strong>${lead.dealStage}</strong> stage for service <strong>${lead.serviceType || 'unspecified'}</strong>.`,
            time: lead.createdAt,
            icon: 'user-plus'
          });
          if (lead.createdAt !== lead.updatedAt) {
            allActivities.push({
              leadId: lead._id,
              name: lead.name,
              company: lead.company,
              text: `Prospect dossier updated for <strong>${lead.name}</strong>. Stage: <strong>${lead.dealStage}</strong>.`,
              time: lead.updatedAt,
              icon: 'refresh-cw'
            });
          }
        });

        // Sort by time desc
        allActivities.sort((a,b) => new Date(b.time) - new Date(a.time));
        const feed = allActivities.slice(0, 7);

        if (feed.length > 0) {
          feed.forEach(act => {
            el.operationsList.innerHTML += `
              <div class="operation-item" onclick="openDetailModal('${act.leadId}')" style="cursor: pointer;">
                <div class="operation-avatar">
                  <i data-lucide="${act.icon}"></i>
                </div>
                <div class="operation-body">
                  <span class="operation-text"><strong>${act.name}</strong> (${act.company || 'N/A'}): ${act.text}</span>
                  <span class="operation-time">${formatTimeAgo(act.time)}</span>
                </div>
              </div>
            `;
          });
          lucide.createIcons();
        } else {
          el.operationsList.innerHTML = '<div class="loading-placeholder">No activity stream items found.</div>';
        }
      }
    }
  } catch (err) {
    console.error('Failed loading dashboard:', err);
  }
};

// ── Tab 2: Load Kanban Deals Board ───────────────────────────
const loadKanbanData = async () => {
  try {
    el.kanbanContainer.innerHTML = '<div class="loading-placeholder">Building deals pipeline board...</div>';
    const kanbanRes = await api.getKanban();
    
    if (kanbanRes.success) {
      const data = kanbanRes.data;
      el.kanbanContainer.innerHTML = '';
      
      state.meta.DEAL_STAGES.forEach(stage => {
        const stageLeads = data[stage] || [];
        const formattedStageName = stage.replace(/\s+/g, '_');
        
        let colHtml = `
          <div class="kanban-col" id="col-${formattedStageName}">
            <div class="col-header">
              <div class="col-title-group">
                <span class="stage-badge stage-${formattedStageName}">${stage}</span>
                <span class="col-badge">${stageLeads.length}</span>
              </div>
              <span class="col-value">${stageLeads.length} lead${stageLeads.length !== 1 ? 's' : ''}</span>
            </div>
            <div class="cards-trail" data-stage="${stage}">
        `;

        if (stageLeads.length > 0) {
          stageLeads.forEach(lead => {
            colHtml += `
              <div class="lead-card prio-${lead.priority}" onclick="openDetailModal('${lead._id}')">
                <div class="card-title-row">
                  <span class="lead-name">${lead.name}</span>
                  <div class="card-actions" onclick="event.stopPropagation();">
                    <button class="card-action-btn" title="Edit Lead" onclick="openEditFormModal('${lead._id}')">
                      <i data-lucide="edit-3"></i>
                    </button>
                    <button class="card-action-btn" title="Delete Lead" onclick="confirmDeleteLead('${lead._id}', '${lead.name}')">
                      <i data-lucide="trash-2"></i>
                    </button>
                  </div>
                </div>
                <div class="card-company">${lead.company || 'Private Lead'}</div>
                <div class="card-meta-row">
                  <span class="card-tag">${lead.serviceType || 'General'}</span>
                  <div class="card-actions" onclick="event.stopPropagation();">
                    <button class="card-action-btn" title="Move Left" onclick="moveStage('${lead._id}', -1)" ${state.meta.DEAL_STAGES.indexOf(stage) === 0 ? 'disabled style="opacity: 0.25; cursor: default;"' : ''}>
                      <i data-lucide="arrow-left"></i>
                    </button>
                    <button class="card-action-btn" title="Move Right" onclick="moveStage('${lead._id}', 1)" ${state.meta.DEAL_STAGES.indexOf(stage) === state.meta.DEAL_STAGES.length - 1 ? 'disabled style="opacity: 0.25; cursor: default;"' : ''}>
                      <i data-lucide="arrow-right"></i>
                    </button>
                  </div>
                </div>
              </div>
            `;
          });
        } else {
          colHtml += `
            <div class="loading-placeholder" style="padding: 1.5rem 0.5rem; font-size: 0.78rem;">
              Drop prospects here
            </div>
          `;
        }

        colHtml += `
            </div>
          </div>
        `;
        el.kanbanContainer.innerHTML += colHtml;
      });

      lucide.createIcons();
    }
  } catch (err) {
    console.error('Failed loading Kanban:', err);
  }
};

// Quick Shift Lead Stage on Kanban
window.moveStage = async (id, direction) => {
  try {
    const leadRes = await api.getLead(id);
    if (leadRes.success) {
      const currentStage = leadRes.data.dealStage;
      const currentIndex = state.meta.DEAL_STAGES.indexOf(currentStage);
      const nextIndex = currentIndex + direction;
      
      if (nextIndex >= 0 && nextIndex < state.meta.DEAL_STAGES.length) {
        const nextStage = state.meta.DEAL_STAGES[nextIndex];
        const updateRes = await api.updateStage(id, nextStage);
        if (updateRes.success) {
          loadKanbanData();
        }
      }
    }
  } catch (err) {
    console.error('Error shifting deal stage:', err);
  }
};

// ── Tab 3: Load Leads Directory (Table) ──────────────────────
const loadDirectoryData = async () => {
  try {
    el.leadsTableBody.innerHTML = '<tr><td colspan="7" class="loading-row">Querying custom data rows...</td></tr>';
    
    const params = {
      search: state.directory.search,
      stage: state.directory.stage,
      service: state.directory.service,
      priority: state.directory.priority,
      followUpToday: state.directory.followUpToday,
      sortBy: state.directory.sortBy,
      order: state.directory.order,
      page: state.directory.page,
      limit: state.directory.limit
    };

    const res = await api.getLeads(params);
    if (res.success) {
      state.directory.leads = res.data;
      state.directory.totalPages = res.pages;
      state.directory.totalCount = res.total;
      
      // Update pagination UI controls
      el.currentPageNum.textContent = state.directory.page;
      el.btnPrevPage.disabled = state.directory.page <= 1;
      el.btnNextPage.disabled = state.directory.page >= state.directory.totalPages;

      // Update Pagination Text Info
      const startCount = state.directory.leads.length === 0 ? 0 : (state.directory.page - 1) * state.directory.limit + 1;
      const endCount = (state.directory.page - 1) * state.directory.limit + state.directory.leads.length;
      el.paginationInfoText.textContent = `Showing ${startCount} to ${endCount} of ${state.directory.totalCount} leads`;

      el.leadsTableBody.innerHTML = '';
      if (state.directory.leads.length > 0) {
        state.directory.leads.forEach(lead => {
          const formattedStage = lead.dealStage.replace(/\s+/g, '_');
          el.leadsTableBody.innerHTML += `
            <tr onclick="openDetailModal('${lead._id}')" style="cursor: pointer;">
              <td>
                <div class="table-lead-info">
                  <span class="lead-cell-name">${lead.name}</span>
                  <span class="lead-cell-email">${lead.email} • ${lead.phone || 'No phone'}</span>
                </div>
              </td>
              <td><span class="info-val">${lead.company || 'N/A'}</span></td>
              <td><span class="card-tag">${lead.serviceType || 'General'}</span></td>
              <td><span class="badge priority-badge prio-${lead.priority}">${lead.priority}</span></td>
              <td><span class="badge stage-badge stage-${formattedStage}">${lead.dealStage}</span></td>
              <td><span class="info-val" style="font-size: 0.8rem;">${formatDate(lead.followUpDate)}</span></td>
              <td onclick="event.stopPropagation();">
                <div class="card-actions">
                  <button class="card-action-btn" title="View details" onclick="openDetailModal('${lead._id}')">
                    <i data-lucide="eye"></i>
                  </button>
                  <button class="card-action-btn" title="Edit record" onclick="openEditFormModal('${lead._id}')">
                    <i data-lucide="edit-3"></i>
                  </button>
                  <button class="card-action-btn" title="Delete record" onclick="confirmDeleteLead('${lead._id}', '${lead.name}')">
                    <i data-lucide="trash-2"></i>
                  </button>
                </div>
              </td>
            </tr>
          `;
        });
        lucide.createIcons();
      } else {
        el.leadsTableBody.innerHTML = '<tr><td colspan="7" class="loading-row">No matching leads in database. Modify filter terms.</td></tr>';
      }
    }
  } catch (err) {
    console.error('Failed loading leads directory:', err);
  }
};

// Sorting columns
document.querySelectorAll('.leads-table th.sortable').forEach(header => {
  header.addEventListener('click', () => {
    const field = header.getAttribute('data-sort');
    if (state.directory.sortBy === field) {
      state.directory.order = state.directory.order === 'asc' ? 'desc' : 'asc';
    } else {
      state.directory.sortBy = field;
      state.directory.order = 'asc';
    }
    loadDirectoryData();
  });
});

// Pagination clicks
el.btnPrevPage.addEventListener('click', () => {
  if (state.directory.page > 1) {
    state.directory.page--;
    loadDirectoryData();
  }
});
el.btnNextPage.addEventListener('click', () => {
  if (state.directory.page < state.directory.totalPages) {
    state.directory.page++;
    loadDirectoryData();
  }
});

// Directory filters listeners
el.filterStage.addEventListener('change', (e) => {
  state.directory.stage = e.target.value;
  state.directory.page = 1;
  loadDirectoryData();
});
el.filterService.addEventListener('change', (e) => {
  state.directory.service = e.target.value;
  state.directory.page = 1;
  loadDirectoryData();
});
el.filterPriority.addEventListener('change', (e) => {
  state.directory.priority = e.target.value;
  state.directory.page = 1;
  loadDirectoryData();
});
el.filterFollowupToday.addEventListener('change', (e) => {
  state.directory.followUpToday = e.target.checked;
  state.directory.page = 1;
  loadDirectoryData();
});

// Debounce helper for instant full-text search
let searchDebounceTimer;
el.searchInput.addEventListener('input', (e) => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    state.directory.search = e.target.value;
    state.directory.page = 1;
    loadDirectoryData();
  }, 350);
});

// ── Modals: Create & Edit Form ────────────────────────────────
const openEditFormModal = async (id = '') => {
  el.leadEditForm.reset();
  el.formLeadId.value = '';
  
  if (id) {
    el.leadModalTitle.textContent = 'Edit Lead Dossier';
    try {
      const res = await api.getLead(id);
      if (res.success) {
        const lead = res.data;
        el.formLeadId.value = lead._id;
        el.formName.value = lead.name || '';
        el.formCompany.value = lead.company || '';
        el.formEmail.value = lead.email || '';
        el.formPhone.value = lead.phone || '';
        el.formService.value = lead.serviceType || '';
        el.formPriority.value = lead.priority || 'Medium';
        el.formStage.value = lead.dealStage || 'New';
        el.formSource.value = lead.source || '';
        el.formTimeline.value = lead.timeline || '';
        el.formEnquiry.value = lead.enquiry || '';
        
        if (lead.followUpDate) {
          // Format as YYYY-MM-DD for standard html date picker input
          const d = new Date(lead.followUpDate);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          el.formFollowup.value = `${yyyy}-${mm}-${dd}`;
        } else {
          el.formFollowup.value = '';
        }
      }
    } catch (err) {
      console.error('Error fetching lead details:', err);
    }
  } else {
    el.leadModalTitle.textContent = 'Create New Lead';
    el.formFollowup.value = new Date().toISOString().split('T')[0]; // Default to today
  }

  el.modalLeadForm.classList.add('active');
};

const closeFormModal = () => {
  el.modalLeadForm.classList.remove('active');
};

el.btnAddLeadTop.addEventListener('click', () => openEditFormModal());
el.btnCancelFormModal.addEventListener('click', closeFormModal);
el.btnCloseFormModal.addEventListener('click', closeFormModal);

// Form submit handler
el.leadEditForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const leadId = el.formLeadId.value;
  const leadData = {
    name: el.formName.value,
    company: el.formCompany.value,
    email: el.formEmail.value,
    phone: el.formPhone.value,
    serviceType: el.formService.value || undefined,
    priority: el.formPriority.value,
    dealStage: el.formStage.value,
    source: el.formSource.value,
    timeline: el.formTimeline.value || undefined,
    followUpDate: el.formFollowup.value ? new Date(el.formFollowup.value) : null,
    enquiry: el.formEnquiry.value
  };

  try {
    let res;
    if (leadId) {
      res = await api.updateLead(leadId, leadData);
    } else {
      res = await api.createLead(leadData);
    }

    if (res.success) {
      closeFormModal();
      // Reload matching dataset
      if (state.activeTab === 'dashboard') loadDashboardData();
      else if (state.activeTab === 'kanban') loadKanbanData();
      else if (state.activeTab === 'leads') loadDirectoryData();
    } else {
      alert('Error updating data: ' + (res.error || 'Server error'));
    }
  } catch (err) {
    console.error('Error submitting form:', err);
  }
});

// Delete lead
window.confirmDeleteLead = async (id, name) => {
  if (confirm(`Are you absolutely sure you want to permanently delete lead details for "${name}"?`)) {
    try {
      const res = await api.deleteLead(id);
      if (res.success) {
        if (state.activeTab === 'dashboard') loadDashboardData();
        else if (state.activeTab === 'kanban') loadKanbanData();
        else if (state.activeTab === 'leads') loadDirectoryData();
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  }
};

// ── Modals: Deep Details Activity Logs Monitor ───────────────
let activeLeadIdInDetail = null;

window.openDetailModal = async (id) => {
  activeLeadIdInDetail = id;
  el.formNoteText.value = '';
  
  try {
    const res = await api.getLead(id);
    if (res.success) {
      const lead = res.data;
      
      // Update UI texts
      el.detailLeadName.textContent = lead.name;
      
      // Class Priority Badge
      el.detailLeadPriority.className = `badge priority-badge prio-${lead.priority}`;
      el.detailLeadPriority.textContent = `${lead.priority} Priority`;

      // Class Stage Badge
      const formattedStage = lead.dealStage.replace(/\s+/g, '_');
      el.detailLeadStage.className = `badge stage-badge stage-${formattedStage}`;
      el.detailLeadStage.textContent = lead.dealStage;

      el.detailCompany.textContent = lead.company || 'Private Individual';
      el.detailEmail.textContent = lead.email;
      el.detailEmail.href = `mailto:${lead.email}`;
      el.detailPhone.textContent = lead.phone || 'Not Logged';
      el.detailService.textContent = lead.serviceType || 'Not Specified';
      el.detailSource.textContent = lead.source || 'N/A';
      el.detailTimeline.textContent = lead.timeline || 'Undecided';
      el.detailFollowup.textContent = formatDate(lead.followUpDate);
      el.detailEnquiry.textContent = lead.enquiry || 'No requirement statement available.';

      // Timeline Log Trail Render
      renderActivityLog(lead.activityLog);
      
      el.modalLeadDetail.classList.add('active');
    }
  } catch (err) {
    console.error('Error loading deep logs:', err);
  }
};

const renderActivityLog = (logs) => {
  el.detailActivityLog.innerHTML = '';
  
  // Sort logs by newest first
  const sortedLogs = [...logs].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  if (sortedLogs.length > 0) {
    sortedLogs.forEach(entry => {
      let icon = 'message-square';
      if (entry.type === 'stage-change') icon = 'git-commit';
      else if (entry.type === 'update') icon = 'edit';
      else if (entry.type === 'follow-up') icon = 'phone-call';
      
      el.detailActivityLog.innerHTML += `
        <div class="timeline-card">
          <div class="timeline-icon type-${entry.type}">
            <i data-lucide="${icon}"></i>
          </div>
          <div class="timeline-content">
            <span class="timeline-desc">${entry.description}</span>
            <span class="timeline-time">${formatDate(entry.createdAt)} at ${new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      `;
    });
    lucide.createIcons();
  } else {
    el.detailActivityLog.innerHTML = '<div class="loading-placeholder">No transaction logs available for this lead.</div>';
  }
};

const closeDetailModal = () => {
  el.modalLeadDetail.classList.remove('active');
  activeLeadIdInDetail = null;
  
  // Refresh stats if stage was updated or notes were added in the background
  if (state.activeTab === 'dashboard') loadDashboardData();
  else if (state.activeTab === 'kanban') loadKanbanData();
  else if (state.activeTab === 'leads') loadDirectoryData();
};

el.btnCloseDetailModal.addEventListener('click', closeDetailModal);

// Inline Log custom note submission
el.addNoteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!activeLeadIdInDetail) return;

  const noteText = el.formNoteText.value.trim();
  if (!noteText) return;

  try {
    const res = await api.updateLead(activeLeadIdInDetail, { newNote: noteText });
    if (res.success) {
      el.formNoteText.value = '';
      // Refresh the timeline from database response
      renderActivityLog(res.data.activityLog);
    }
  } catch (err) {
    console.error('Error logging timeline entry:', err);
  }
});

// Close modals when clicking backdrop area
window.addEventListener('click', (e) => {
  if (e.target === el.modalLeadForm) closeFormModal();
  if (e.target === el.modalLeadDetail) closeDetailModal();
});

// ── Setup Menu Clickers ───────────────────────────────────────
el.navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');
    switchTab(tabName);
  });
});

// ── Bootstrapping application ──────────────────────────────────
const initApp = async () => {
  await initMetaOptions();
  switchTab('dashboard'); // Initial view load
};

document.addEventListener('DOMContentLoaded', initApp);
