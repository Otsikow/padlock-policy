import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";

type ProductStatus = Database["public"]["Enums"]["product_status_enum"];

interface ProductStatusBadgeProps {
  status: ProductStatus;
}

const statusConfig: Record<
  ProductStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  draft: {
    label: "Draft",
    variant: "outline",
    className: "border-gray-300 text-gray-700",
  },
  pending_review: {
    label: "Pending Review",
    variant: "default",
    className: "bg-yellow-500 hover:bg-yellow-600 text-white",
  },
  active: {
    label: "Active",
    variant: "default",
    className: "bg-green-500 hover:bg-green-600 text-white",
  },
  paused: {
    label: "Paused",
    variant: "secondary",
    className: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  archived: {
    label: "Archived",
    variant: "destructive",
    className: "bg-gray-500 hover:bg-gray-600 text-white",
  },
};

export const ProductStatusBadge = ({ status }: ProductStatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};
