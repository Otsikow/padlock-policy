import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { Tables } from "@/integrations/supabase/types";
import { Eye, MousePointerClick, CheckCircle, Edit, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type InsuranceProduct = Tables<"insurance_products">;

interface ProductCardProps {
  product: InsuranceProduct;
  onEdit?: (productId: string) => void;
  onViewStats?: (productId: string) => void;
  onChangeStatus?: (productId: string, newStatus: InsuranceProduct["status"]) => void;
  onDelete?: (productId: string) => void;
}

export const ProductCard = ({
  product,
  onEdit,
  onViewStats,
  onChangeStatus,
  onDelete,
}: ProductCardProps) => {
  const formatCurrency = (amount: number, currency: string = "GBP") => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {product.product_name}
            </h3>
            <p className="mt-1 text-sm text-gray-600 capitalize">
              {product.insurance_type.replace("_", " ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {product.status && <ProductStatusBadge status={product.status} />}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(product.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewStats?.(product.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Stats
                </DropdownMenuItem>
                {product.status === "active" && (
                  <DropdownMenuItem onClick={() => onChangeStatus?.(product.id, "paused")}>
                    Pause Product
                  </DropdownMenuItem>
                )}
                {product.status === "paused" && (
                  <DropdownMenuItem onClick={() => onChangeStatus?.(product.id, "active")}>
                    Activate Product
                  </DropdownMenuItem>
                )}
                {product.status === "draft" && (
                  <DropdownMenuItem onClick={() => onChangeStatus?.(product.id, "pending_review")}>
                    Submit for Review
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => onDelete?.(product.id)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {product.short_summary && (
          <p className="mb-4 line-clamp-2 text-sm text-gray-600">
            {product.short_summary}
          </p>
        )}

        <div className="mb-4 flex items-center gap-4">
          <div>
            <p className="text-xs text-gray-500">Starting from</p>
            <p className="text-xl font-bold text-purple-600">
              {formatCurrency(product.premium_start_price, product.currency || "GBP")}
            </p>
          </div>
          {product.ai_quality_score !== null && product.ai_quality_score > 0 && (
            <div>
              <p className="text-xs text-gray-500">AI Quality Score</p>
              <p className="text-xl font-bold text-gray-900">
                {product.ai_quality_score.toFixed(1)}/5.0
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center text-gray-400">
              <Eye className="h-4 w-4" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {product.view_count || 0}
            </p>
            <p className="text-xs text-gray-500">Views</p>
          </div>
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center text-gray-400">
              <MousePointerClick className="h-4 w-4" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {product.click_count || 0}
            </p>
            <p className="text-xs text-gray-500">Clicks</p>
          </div>
          <div className="text-center">
            <div className="mb-1 flex items-center justify-center text-gray-400">
              <CheckCircle className="h-4 w-4" />
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {product.conversion_count || 0}
            </p>
            <p className="text-xs text-gray-500">Conversions</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
