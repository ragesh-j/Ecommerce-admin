import api from "./axios";

export const getProducts = async () => {
  const res = await api.get("/products");
  return res.data.data;
};

export const toggleFeatured = async (id: string) => {
  const res = await api.patch(`/products/${id}/feature`);
  return res.data.data.product;
};