import api from "./axios";

export const getTags = async () => {
  const res = await api.get("/tags");
  return res.data.data.tags;
};

export const createTag = async (data: { name: string; slug: string }) => {
  const res = await api.post("/tags", data);
  return res.data.data.tag;
};

export const updateTag = async (id: string, data: { name?: string; slug?: string }) => {
  const res = await api.put(`/tags/${id}`, data);
  return res.data.data.tag;
};

export const deleteTag = async (id: string) => {
  await api.delete(`/tags/${id}`);
};