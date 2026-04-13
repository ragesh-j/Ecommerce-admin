import api from "./axios";

export const getCategories = async () => {
  const res = await api.get("/categories");
  return res.data.data.categories;
};

export const createCategory = async (data: { name: string; slug: string; parentId?: string }) => {
  const res = await api.post("/categories", data);
  return res.data.data.category;
};

export const updateCategory = async (id: string, data: { name?: string; slug?: string; parentId?: string }) => {
  const res = await api.put(`/categories/${id}`, data);
  return res.data.data.category;
};

export const deleteCategory = async (id: string) => {
  await api.delete(`/categories/${id}`);
};