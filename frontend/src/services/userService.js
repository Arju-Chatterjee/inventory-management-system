import api from './api';

export const userService = {
  async getUsers() {
    const { data } = await api.get('/users');
    return data;
  },

  async updateUser(id, userData) {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },

  async deleteUser(id) {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  }
};
