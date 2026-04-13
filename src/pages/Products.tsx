import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as productService from "../services/productService";

type Product = {
  id: string;
  name: string;
  slug: string;
  isFeatured: boolean;
  isPublished: boolean;
  salesCount: number;
  category: { name: string; slug: string };
  seller: { id: string; storeName: string };
  variants: { price: number; stock: number }[];
  media: { url: string }[];
  avgRating: number | null;
  reviewCount: number;
};

const Products = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: productService.getProducts,
  });

  const products: Product[] = data?.products || [];

  const { mutate: toggleFeatured } = useMutation({
    mutationFn: productService.toggleFeatured,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} products total</p>
        </div>
      </div>

      {/* list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No products yet. Sellers will add products here.
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product: Product) => (
            <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">

              {/* image */}
              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                {product.media[0] ? (
                  <img src={product.media[0].url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    No image
                  </div>
                )}
              </div>

              {/* info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{product.category.name} • {product.seller.storeName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    product.isPublished ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {product.isPublished ? "Published" : "Draft"}
                  </span>
                  {product.isFeatured && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700">
                      Featured
                    </span>
                  )}
                  {product.variants[0] && (
                    <span className="text-xs text-gray-400">
                      from ₹{product.variants[0].price}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {product.salesCount} sales
                  </span>
                  {product.avgRating && (
                    <span className="text-xs text-gray-400">
                      ★ {product.avgRating.toFixed(1)} ({product.reviewCount})
                    </span>
                  )}
                </div>
              </div>

              {/* actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleFeatured(product.id)}
                  className={`px-3 py-1.5 text-xs border rounded-lg transition-colors ${
                    product.isFeatured
                      ? "text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                      : "text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {product.isFeatured ? "Unfeature" : "Feature"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;