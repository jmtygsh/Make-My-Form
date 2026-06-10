//apps/web/components/layout/form-card.tsx
"use client";

import { useRouter } from "next/navigation";
import { Trash2, Cloud, HardDrive } from "lucide-react";
import { getRelativeTime } from "~/lib/date";
import { Button } from "../ui/button";
import { useSoftDeleteForm } from "~/hooks/api/form";
import { toast } from "sonner";

export type FormSource = "local" | "hosted";

export interface Form {
  id: string;
  shortId: string;
  title?: string | null;
  description?: string | null;
  status: "draft" | "published";
  visibility?: "public" | "unlisted";
  isExpiry?: string | boolean | null;
  createdAt?: Date | string | null;
  updatedAt?: number;
}

function Skeleton({ width, height }: { width: string; height: string }) {
  return <span className={`inline-block ${width} ${height} bg-gray-200 animate-pulse rounded`} />;
}

function SourceBadge({ source }: { source: FormSource }) {
  if (source === "local") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-600 ring-1 ring-amber-200">
        <HardDrive className="h-3 w-3" />
        Local
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 ring-1 ring-emerald-200">
      <Cloud className="h-3 w-3" />
      Hosted
    </span>
  );
}

export function FormCard({
  form,
  source = "hosted",
  isLoading,
}: {
  form: Form;
  source?: FormSource;
  isLoading?: boolean;
}) {
  const router = useRouter();
  const { softDeleteFormAsync } = useSoftDeleteForm();

  const timeAgo = form.createdAt ? getRelativeTime(form.createdAt) : "";

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await softDeleteFormAsync({ shortId: form.shortId });
    } catch (err) {
      toast.error("Failed to delete form. Please try again.");
      console.error("Failed to delete form:", err);
    }
  };

  return (
    <div
      // ✅ navigate by shortId (route [id] === shortId)
      onClick={() => !isLoading && router.push(`/forms/${form.shortId}/edit`)}
      className="flex items-center justify-between px-5 bg-white border border-gray-200/60 rounded-8px hover:border-gray-300 hover:shadow-xs transition-all duration-200 cursor-pointer group select-none active:bg-gray-50/50"
    >
      {/* Title + badge */}
      <span className="flex items-center gap-2 truncate pr-4 py-3.5">
        <span className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900 transition-colors">
          {isLoading ? <Skeleton width="w-24" height="h-4" /> : form.title || "Untitled"}
        </span>
        {!isLoading && <SourceBadge source={source} />}
      </span>

      {/* Right side */}
      <div className="flex items-center shrink-0 gap-3">
        {isLoading ? (
          <Skeleton width="w-32" height="h-3" />
        ) : (
          <span className="text-xs text-gray-400 whitespace-nowrap tabular-nums">
            {form.status} {timeAgo && `· ${timeAgo}`}
          </span>
        )}

        {!isLoading && form.visibility && (
          <span className="text-xs text-gray-400 whitespace-nowrap tabular-nums">
            {form.visibility}
          </span>
        )}

        {!isLoading && form.isExpiry && (
          <span className="px-2 py-0.5 text-xs font-medium text-red-600 bg-red-100 rounded">
            Expired
          </span>
        )}

        {/* Local drafts aren't on the server yet → no delete button */}
        {!isLoading && source === "hosted" && (
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
