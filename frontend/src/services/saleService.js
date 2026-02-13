import api from './api';

export const saleService = {
  async getSales(params = {}) {
    const { data } = await api.get('/sales', { params });
    return data;
  },

  async getSale(id) {
    const { data } = await api.get(`/sales/${id}`);
    return data;
  },

  async createSale(saleData) {
    const { data } = await api.post('/sales', saleData);
    return data;
  },

  async deleteSale(id) {
    const { data } = await api.delete(`/sales/${id}`);
    return data;
  }
};
