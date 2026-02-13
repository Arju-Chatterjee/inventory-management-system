import api from './api';

export const categoryService = {
  async getCategories() {
    const { data } = await api.get('/categories');
    return data;
  },

  async createCategory(categoryData) {
    const { data } = await api.post('/categories', categoryData);
    return data;
  },

  async updateCategory(id, categoryData) {
    const { data } = await api.put(`/categories/${id}`, categoryData);
    return data;
  },

  async deleteCategory(id) {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  }
};
