import api from './api';

export const productService = {
  async getProducts(params = {}) {
    const { data } = await api.get('/products', { params });
    return data;
  },

  async getProduct(id) {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  async createProduct(productData) {
    const { data } = await api.post('/products', productData);
    return data;
  },

  async updateProduct(id, productData) {
    const { data } = await api.put(`/products/${id}`, productData);
    return data;
  },

  async deleteProduct(id) {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  }
};
