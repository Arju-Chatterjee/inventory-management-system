import api from './api';

export const supplierService = {
  async getSuppliers() {
    const { data } = await api.get('/suppliers');
    return data;
  },

  async createSupplier(supplierData) {
    const { data } = await api.post('/suppliers', supplierData);
    return data;
  },

  async updateSupplier(id, supplierData) {
    const { data } = await api.put(`/suppliers/${id}`, supplierData);
    return data;
  },

  async deleteSupplier(id) {
    const { data } = await api.delete(`/suppliers/${id}`);
    return data;
  }
};
