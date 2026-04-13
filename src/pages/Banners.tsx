import { useActionState,useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as bannerService from "../services/bannerService";

type Banner = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
  isActive: boolean;
};

const Banners = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // ─── queries ────────────────────────────────────────────────────────────────
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: bannerService.getBanners,
  });

  // ─── mutations ──────────────────────────────────────────────────────────────
  const { mutate: toggleBanner } = useMutation({
    mutationFn: bannerService.toggleBanner,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
  });

  const { mutate: deleteBanner } = useMutation({
    mutationFn: bannerService.deleteBanner,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
  });

  // ─── form action (React 19) ──────────────────────────────────────────────────
  const [formError, submitAction, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      const data = {
        title: formData.get("title") as string,
        subtitle: (formData.get("subtitle") as string) || undefined,
        linkUrl: (formData.get("linkUrl") as string) || undefined,
        order: Number(formData.get("order")) || 0,
      };

      try {
        if (editingBanner) {
          await bannerService.updateBanner(editingBanner.id, data);
          setEditingBanner(null);
        } else {
          await bannerService.createBanner(data);
          setShowForm(false);
        }
        queryClient.invalidateQueries({ queryKey: ["banners"] });
        return null;
      } catch (err: any) {
  const errors = err.response?.data?.errors;
  if (errors && Array.isArray(errors)) {
    return errors.map((e: any) => `${e.field}: ${e.message}`).join(", ");
  }
  return err.response?.data?.message || "Something went wrong";
}
    },
    null
  );

  // ─── image upload ────────────────────────────────────────────────────────────
  const handleImageUpload = async (id: string, file: File) => {
    setUploadingId(id);
    try {
      await bannerService.uploadBannerImage(id, file);
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    } catch (err: any) {
      console.error(err);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500 mt-0.5">{banners.length} banners total</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingBanner(null); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add banner
        </button>
      </div>

      {/* form */}
      {(showForm || editingBanner) && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-900 mb-4">
            {editingBanner ? "Edit banner" : "New banner"}
          </h2>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {formError}
            </div>
          )}

          <form action={submitAction} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input
                name="title"
                defaultValue={editingBanner?.title}
                required
                placeholder="Summer sale"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle</label>
              <input
                name="subtitle"
                defaultValue={editingBanner?.subtitle}
                placeholder="Up to 50% off"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Link URL</label>
              <input
                name="linkUrl"
                defaultValue={editingBanner?.linkUrl}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
              <input
                name="order"
                type="number"
                defaultValue={editingBanner?.order ?? 0}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingBanner(null); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {isPending ? "Saving..." : editingBanner ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No banners yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner: Banner) => (
            <div key={banner.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">

              {/* image */}
              <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                {banner.imageUrl ? (
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    No image
                  </div>
                )}
                {uploadingId === banner.id && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{banner.title}</p>
                {banner.subtitle && (
                  <p className="text-xs text-gray-500 truncate">{banner.subtitle}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    banner.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-gray-400">Order: {banner.order}</span>
                </div>
              </div>

              {/* actions */}
              <div className="flex items-center gap-2 shrink-0">
                <label className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg cursor-pointer transition-colors">
                  {uploadingId === banner.id ? "Uploading..." : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(banner.id, file);
                    }}
                  />
                </label>

                <button
                  onClick={() => toggleBanner(banner.id)}
                  className={`px-3 py-1.5 text-xs border rounded-lg transition-colors ${
                    banner.isActive
                      ? "text-orange-600 border-orange-200 hover:bg-orange-50"
                      : "text-green-600 border-green-200 hover:bg-green-50"
                  }`}
                >
                  {banner.isActive ? "Deactivate" : "Activate"}
                </button>

                <button
                  onClick={() => { setEditingBanner(banner); setShowForm(false); }}
                  className="px-3 py-1.5 text-xs text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Edit
                </button>

                <button
                  onClick={() => { if (confirm("Delete this banner?")) deleteBanner(banner.id); }}
                  className="px-3 py-1.5 text-xs text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Banners;