import api from './api';

export const reportService = {
  async getDashboard() {
    const { data } = await api.get('/reports/dashboard');
    return data;
  },

  async getSalesReport(params = {}) {
    const { data } = await api.get('/reports/sales', { params });
    return data;
  },

  async getInventoryReport(params = {}) {
    const { data } = await api.get('/reports/inventory', { params });
    return data;
  },

  downloadSalesReportCSV(params = {}) {
    return api.get('/reports/sales', {
      params: { ...params, format: 'csv' },
      responseType: 'blob'
    });
  },

  downloadInventoryReportCSV(params = {}) {
    return api.get('/reports/inventory', {
      params: { ...params, format: 'csv' },
      responseType: 'blob'
    });
  }
};
