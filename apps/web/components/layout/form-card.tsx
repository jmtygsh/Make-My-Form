"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { getRelativeTime } from "~/lib/date";
import { Button } from "../ui/button";

export interface Form {
    id: string;
    title?: string;
    hasPublished?: boolean;
    createdAt: Date | string | null;
}

export function FormCard({ form }: { form: Form }) {
    const router = useRouter();

    const status = form.hasPublished ? "Published" : "Draft";
    const timeAgo = getRelativeTime(form.createdAt);
    const href = `/forms/${form.id}/edit`;


    // handle delete TODO
    const handleDelete = () => { };

    return (
        <div
            onClick={() => router.push(href)}
            className="flex items-center justify-between px-5 bg-white border border-gray-200/60 rounded-[8px] hover:border-gray-300 hover:shadow-xs transition-all duration-200 cursor-pointer group select-none active:bg-gray-50/50 "
        >
            <span className="text-sm font-medium text-gray-700 truncate pr-4 group-hover:text-gray-900 transition-colors py-3.5">
                {form.title || "Untitled"}
            </span>


            <div className="flex items-center shrink-0 gap-3">
                <span className={`text-xs text-gray-400 whitespace-nowrap tabular-nums`}>
                    {status} · {timeAgo}
                </span>

                <Button size="xs" title="Delete" variant="ghost" onClick={handleDelete} className="hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors duration-200">
                    <Trash2 className="h-2 w-2" />
                </Button>
            </div>
        </div>
    );
}