"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { getRelativeTime } from "~/lib/date";
import { Button } from "../ui/button";
import { useSoftDeleteForm } from "~/hooks/api/form";
import { toast } from "sonner";

export interface Form {
  id: string;
  shortId: string;
  title?: string | null;
  description?: string | null;
  status: "draft" | "published";
  visibility: "public" | "unlisted";
  isExpiry?: string | boolean | null;
  createdAt: Date | string | null;
  totalCount?: number;
}

function Skeleton({ width, height }: { width: string; height: string }) {
  return <span className={`inline-block ${width} ${height} bg-gray-200 animate-pulse rounded`} />;
}

export function FormCard({ form, isLoading }: { form: Form; isLoading?: boolean }) {
  const router = useRouter();
  const { softDeleteFormAsync } = useSoftDeleteForm();

  const timeAgo = form.createdAt ? getRelativeTime(form.createdAt) : "";

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent navigation
    try {
      await softDeleteFormAsync({ shortId: form.shortId });
    } catch (err) {
      toast.error("Failed to delete form. Please try again.");
      console.error("Failed to delete form:", err);
    }
  };

  return (
    <div
      onClick={() => !isLoading && router.push(`/forms/${form.id}/edit`)}
      className="flex items-center justify-between px-5 bg-white border border-gray-200/60 rounded-8px hover:border-gray-300 hover:shadow-xs transition-all duration-200 cursor-pointer group select-none active:bg-gray-50/50"
    >
      {/* Title */}
      <span className="text-sm font-medium text-gray-700 truncate pr-4 group-hover:text-gray-900 transition-colors py-3.5">
        {isLoading ? <Skeleton width="w-24" height="h-4" /> : form.title || "Untitled"}
      </span>

      {/* Right side */}
      <div className="flex items-center shrink-0 gap-3">
        {isLoading ? (
          <Skeleton width="w-32" height="h-3" />
        ) : (
          <span className="text-xs text-gray-400 whitespace-nowrap tabular-nums">
            {form.status} · {timeAgo}
          </span>
        )}

        {isLoading ? (
          <Skeleton width="w-20" height="h-3" />
        ) : (
          <span className="text-xs text-gray-400 whitespace-nowrap tabular-nums">
            {form.visibility}
          </span>
        )}

        {!isLoading && form.isExpiry && (
          <span className="px-2 py-0.5 text-xs font-medium text-red-600 bg-red-100 rounded">
            Expired
          </span>
        )}

        {!isLoading && (
          <Button
            size="xs"
            title="Delete"
            variant="ghost"
            onClick={handleDelete}
            className="hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors duration-200"
          >
            <Trash2 className="h-2 w-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
