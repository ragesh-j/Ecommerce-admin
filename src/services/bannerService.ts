import api from "./axios";

export const getBanners = async () => {
  const res = await api.get("/banners/all");
  return res.data.data.banners;
};

export const createBanner = async (data: { title: string; subtitle?: string; linkUrl?: string; order?: number }) => {
  const res = await api.post("/banners", data);
  return res.data.data.banner;
};

export const uploadBannerImage = async (id: string, file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await api.post(`/banners/${id}/image`, formData);
  return res.data.data.banner;
};

export const updateBanner = async (id: string, data: { title?: string; subtitle?: string; linkUrl?: string; order?: number }) => {
  const res = await api.put(`/banners/${id}`, data);
  return res.data.data.banner;
};

export const toggleBanner = async (id: string) => {
  const res = await api.patch(`/banners/${id}/toggle`);
  return res.data.data.banner;
};

export const deleteBanner = async (id: string) => {
  await api.delete(`/banners/${id}`);
};