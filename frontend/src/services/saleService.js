import api from "./api";

export const saleService = {

  /* ================= GET SALES ================= */
  getHistory: async () => {
    const res = await api.get("/sales");
    return res.data?.data || [];
  },

  /* ================= CREATE SALE ================= */
  create: async (data) => {
    const res = await api.post("/sales", data);
    return res.data?.data;
  },

  /* ================= UPDATE SALE ================= */
  update: async (id, data) => {
    const res = await api.put(`/sales/${id}`, data);
    return res.data?.data;
  }

};
