import { useState, useActionState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as categoryService from "../services/categoryService";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  children?: Category[];
};

const Categories = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // ─── query ───────────────────────────────────────────────────────────────────
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  // ─── delete ──────────────────────────────────────────────────────────────────
  const { mutate: deleteCategory } = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  });

  // ─── form action ─────────────────────────────────────────────────────────────
  const [formError, submitAction, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      const parentId = formData.get("parentId") as string;
      const data = {
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
        parentId: parentId || undefined,
      };

      try {
        if (editingCategory) {
          await categoryService.updateCategory(editingCategory.id, data);
          setEditingCategory(null);
        } else {
          await categoryService.createCategory(data);
          setShowForm(false);
        }
        queryClient.invalidateQueries({ queryKey: ["categories"] });
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

  // ─── auto generate slug ───────────────────────────────────────────────────────
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slugInput = document.getElementById("slug") as HTMLInputElement;
    if (slugInput && !editingCategory) {
      slugInput.value = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
  };

  // ─── flatten categories for parent select ────────────────────────────────────
  const flatCategories = categories.flatMap((c: Category) => [
    c,
    ...(c.children || []),
  ]);

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} top-level categories</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingCategory(null); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add category
        </button>
      </div>

      {/* form */}
      {(showForm || editingCategory) && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-900 mb-4">
            {editingCategory ? "Edit category" : "New category"}
          </h2>

          {formError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {formError}
            </div>
          )}

          <form action={submitAction} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                name="name"
                defaultValue={editingCategory?.name}
                required
                placeholder="Electronics"
                onChange={handleNameChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
              <input
                id="slug"
                name="slug"
                defaultValue={editingCategory?.slug}
                required
                placeholder="electronics"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Parent category <span className="text-gray-400">(optional)</span>
              </label>
              <select
                name="parentId"
                defaultValue={editingCategory?.parentId || ""}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None (top level)</option>
                {flatCategories.map((c: Category) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingCategory(null); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {isPending ? "Saving..." : editingCategory ? "Update" : "Create"}
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
      ) : categories.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No categories yet. Create your first one.
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category: Category) => (
            <div key={category.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">

              {/* parent */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M3 7h18M3 12h18M3 17h18" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{category.name}</p>
                    <p className="text-xs text-gray-400">{category.slug}</p>
                  </div>
                  {category.children && category.children.length > 0 && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {category.children.length} subcategories
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditingCategory(category); setShowForm(false); }}
                    className="px-3 py-1.5 text-xs text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => { if (confirm("Delete this category?")) deleteCategory(category.id); }}
                    className="px-3 py-1.5 text-xs text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* children */}
              {category.children && category.children.length > 0 && (
                <div className="border-t border-gray-100">
                  {category.children.map((child: Category) => (
                    <div key={child.id} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3 ml-6">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        <div>
                          <p className="text-sm text-gray-700">{child.name}</p>
                          <p className="text-xs text-gray-400">{child.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditingCategory(child); setShowForm(false); }}
                          className="px-3 py-1.5 text-xs text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { if (confirm("Delete this category?")) deleteCategory(child.id); }}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;