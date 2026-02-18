import api from "./api";

export const saleService = {

  getHistory: async () => {
    const res = await api.get("/sales");
    return res.data?.data || [];
  },

  create: async (data) => {
    const res = await api.post("/sales", data);
    return res.data?.data;
  }

};
