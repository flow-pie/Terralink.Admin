window.TERRA.store = {
  state: {
    currentPage: 'dashboard',
    searchQuery: '',
    borrowers: [],
    officers: [],
    loans: [],
    repayments: [],
    auditLogs: [],
    notifications: [],
    dashboardStats: null,
    pagination: {
      borrowers: { page: 1, pageSize: 10, total: 0 },
      officers: { page: 1, pageSize: 10, total: 0 },
      loans: { page: 1, pageSize: 10, total: 0 },
      audit: { page: 1, pageSize: 10, total: 0 }
    },
    filters: {
      borrowers: { kyc: 'All', sort: 'recent' },
      loans: { status: 'All' },
      audit: { user: 'All', action: 'All' }
    }
  },

  setPage(page) {
    this.state.currentPage = page;
    this.state.searchQuery = '';
  },

  setSearch(query) {
    this.state.searchQuery = query;
  }
};