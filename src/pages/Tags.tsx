import { useState, useActionState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as tagService from "../services/tagService";

type Tag = {
  id: string;
  name: string;
  slug: string;
};

const Tags = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // ─── query ───────────────────────────────────────────────────────────────────
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["tags"],
    queryFn: tagService.getTags,
  });

  // ─── delete ──────────────────────────────────────────────────────────────────
  const { mutate: deleteTag } = useMutation({
    mutationFn: tagService.deleteTag,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tags"] }),
  });

  // ─── form action ─────────────────────────────────────────────────────────────
  const [formError, submitAction, isPending] = useActionState(
    async (_prev: string | null, formData: FormData) => {
      const data = {
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
      };

      try {
        if (editingTag) {
          await tagService.updateTag(editingTag.id, data);
          setEditingTag(null);
        } else {
          await tagService.createTag(data);
          setShowForm(false);
        }
        queryClient.invalidateQueries({ queryKey: ["tags"] });
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
    const slugInput = document.getElementById("tag-slug") as HTMLInputElement;
    if (slugInput && !editingTag) {
      slugInput.value = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
  };

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Tags</h1>
          <p className="text-sm text-gray-500 mt-0.5">{tags.length} tags total</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingTag(null); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Add tag
        </button>
      </div>

      {/* form */}
      {(showForm || editingTag) && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-900 mb-4">
            {editingTag ? "Edit tag" : "New tag"}
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
                defaultValue={editingTag?.name}
                required
                placeholder="Trending"
                onChange={handleNameChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
              <input
                id="tag-slug"
                name="slug"
                defaultValue={editingTag?.slug}
                required
                placeholder="trending"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingTag(null); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {isPending ? "Saving..." : editingTag ? "Update" : "Create"}
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
      ) : tags.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No tags yet. Create your first one.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag: Tag) => (
            <div key={tag.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{tag.name}</p>
                <p className="text-xs text-gray-400">{tag.slug}</p>
              </div>
              <div className="flex items-center gap-1.5 ml-2">
                <button
                  onClick={() => { setEditingTag(tag); setShowForm(false); }}
                  className="px-2.5 py-1 text-xs text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => { if (confirm("Delete this tag?")) deleteTag(tag.id); }}
                  className="px-2.5 py-1 text-xs text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
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

export default Tags;