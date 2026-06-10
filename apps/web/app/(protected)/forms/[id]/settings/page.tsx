// apps/web/app/(protected)/forms/[id]/settings/page.tsx

"use client";

import React, { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Copy,
  Check,
  Globe,
  Link as LinkIcon,
  Loader2,
  Download,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGetMyFormById, useGetAllFormSubmissions, useUpdateFormSetting } from "~/hooks/api/form";
import { fromPayload } from "~/lib/form-builder/serialize";
import { isInputType, type Block } from "~/lib/form-builder/schema";
import { cn } from "~/lib/utils";

const PAGE_SIZE = 20;

/** Builds a blockId → label map and an optionId → label map from a payload. */
function indexBlocks(payload: unknown) {
  const parsed = fromPayload(payload);
  const blocks: Block[] = parsed?.blocks ?? [];

  const labelByBlockId = new Map<string, string>();
  const optionLabelById = new Map<string, string>();
  const inputBlocks: Block[] = [];

  for (const block of blocks) {
    if (!isInputType(block.type)) continue;
    inputBlocks.push(block);
    labelByBlockId.set(
      block.id,
      "label" in block && block.label ? block.label : "Untitled question",
    );
    if ("options" in block) {
      for (const opt of block.options) optionLabelById.set(opt.id, opt.label);
    }
  }

  return { inputBlocks, labelByBlockId, optionLabelById };
}

/** Renders one submission value as readable text (resolves option ids → labels). */
function formatValue(value: unknown, optionLabelById: Map<string, string>): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) {
    return value.map((v) => optionLabelById.get(String(v)) ?? String(v)).join(", ") || "—";
  }
  return optionLabelById.get(String(value)) ?? String(value);
}

export default function FormSettingsPage() {
  const params = useParams();
  const shortId = params?.id as string;

  const { form, isLoading } = useGetMyFormById(shortId);

  const [page, setPage] = useState(1);
  const { submissions, pagination } = useGetAllFormSubmissions(shortId, page, PAGE_SIZE);

  const { updateSettingAsync, isUpdating } = useUpdateFormSetting();

  const [copied, setCopied] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${origin}/form/${shortId}`;

  const { inputBlocks, labelByBlockId, optionLabelById } = useMemo(
    () => indexBlocks(form?.published ?? form?.draft),
    [form?.published, form?.draft],
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const setVisibility = async (visibility: "public" | "unlisted") => {
    try {
      await updateSettingAsync({ shortId, visibility });
      toast.success(`Set to ${visibility}`);
    } catch {
      toast.error("Failed to update visibility");
    }
  };

  const setResponseLimit = async (value: number) => {
    try {
      await updateSettingAsync({ shortId, responseLimit: Math.max(0, value) });
      toast.success("Response limit saved");
    } catch {
      toast.error("Failed to update response limit");
    }
  };

  const setExpiry = async (value: string) => {
    try {
      await updateSettingAsync({ shortId, isExpiry: value ? new Date(value) : null });
      toast.success(value ? "Expiry saved" : "Expiry cleared");
    } catch {
      toast.error("Failed to update expiry");
    }
  };

  const downloadCsv = () => {
    if (!submissions?.length) {
      toast.info("No submissions to export");
      return;
    }
    const headers = ["Submitted at", ...inputBlocks.map((b) => labelByBlockId.get(b.id) ?? b.id)];
    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;

    const rows = submissions.map((s) => {
      const cells = [
        s.createdAt ? new Date(s.createdAt).toLocaleString() : "",
        ...inputBlocks.map((b) => formatValue(s.submission[b.id], optionLabelById)),
      ];
      return cells.map((c) => escape(String(c))).join(",");
    });

    const csv = [headers.map(escape).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form?.title || "form"}-responses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const isPublished = form?.status === "published";
  const total = pagination?.total ?? 0;
  const expiryValue = form?.isExpiry ? new Date(form.isExpiry).toISOString().slice(0, 16) : "";

  return (
    <div className="flex flex-col gap-10">
      {/* Share */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900">Share link</h2>
        {isPublished ? (
          <>
            <p className="mt-1 text-sm text-gray-500">
              Your form is live. Share this link to start collecting responses.
            </p>
            <div className="mt-3 flex max-w-xl items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-md border border-gray-200 px-3 py-2">
                <LinkIcon className="h-4 w-4 shrink-0 text-gray-400" />
                <input
                  readOnly
                  value={publicUrl}
                  className="w-full bg-transparent text-sm text-gray-700 outline-none"
                />
              </div>
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </>
        ) : (
          <p className="mt-1 text-sm text-gray-500">Publish this form to get a shareable link.</p>
        )}
      </section>

      {/* Visibility */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900">Visibility</h2>
        <p className="mt-1 text-sm text-gray-500">
          Public forms can be listed and shared widely. Unlisted forms are only reachable by direct
          link.
        </p>
        <div className="mt-3 flex gap-2">
          {(["public", "unlisted"] as const).map((v) => {
            const active = form?.visibility === v;
            return (
              <button
                key={v}
                onClick={() => setVisibility(v)}
                disabled={isUpdating || active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                  active
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50",
                )}
              >
                {v === "public" ? (
                  <Globe className="h-3.5 w-3.5" />
                ) : (
                  <LinkIcon className="h-3.5 w-3.5" />
                )}
                {v}
              </button>
            );
          })}
        </div>
      </section>

      {/* Limits */}
      <section className="grid max-w-xl grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Response limit</h2>
          <p className="mt-1 text-xs text-gray-500">0 = unlimited</p>
          <input
            type="number"
            min={0}
            defaultValue={form?.responseLimit ?? 0}
            onBlur={(e) => setResponseLimit(Number(e.target.value))}
            className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Expiry</h2>
          <p className="mt-1 text-xs text-gray-500">Stops accepting responses after</p>
          <input
            type="datetime-local"
            defaultValue={expiryValue}
            onBlur={(e) => setExpiry(e.target.value)}
            className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
      </section>

      {/* Insights */}
      <section>
        <h2 className="text-sm font-semibold text-gray-900">Insights</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Submissions" value={total} />
          <StatCard label="Questions" value={inputBlocks.length} />
          <StatCard
            label="Latest response"
            value={
              submissions?.[0]?.createdAt
                ? new Date(submissions[0].createdAt).toLocaleDateString()
                : "—"
            }
          />
        </div>

        {inputBlocks.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            {inputBlocks.map((b) => {
              const answered = (submissions ?? []).filter((s) => {
                const v = s.submission[b.id];
                if (v === null || v === undefined || v === "") return false;
                if (Array.isArray(v) && v.length === 0) return false;
                return true;
              }).length;
              const shown = submissions?.length ?? 0;
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2 text-sm"
                >
                  <span className="text-gray-700">{labelByBlockId.get(b.id)}</span>
                  <span className="text-gray-400">
                    {answered}/{shown} answered
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Submissions */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Submissions <span className="text-gray-400">({total})</span>
          </h2>
          <button
            onClick={downloadCsv}
            disabled={!submissions?.length}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Download CSV
          </button>
        </div>

        {!submissions?.length ? (
          <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 py-12 text-center">
            <Inbox className="h-6 w-6 text-gray-300" />
            <p className="text-sm text-gray-400">No submissions yet.</p>
          </div>
        ) : (
          <>
            <div className="mt-3 overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-3 py-2 font-medium">Submitted</th>
                    {inputBlocks.map((b) => (
                      <th key={b.id} className="px-3 py-2 font-medium">
                        {labelByBlockId.get(b.id)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 last:border-0">
                      <td className="whitespace-nowrap px-3 py-2 text-gray-500">
                        {s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}
                      </td>
                      {inputBlocks.map((b) => (
                        <td key={b.id} className="px-3 py-2 text-gray-700">
                          {formatValue(s.submission[b.id], optionLabelById)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPrevPage}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 transition-colors hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNextPage}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 transition-colors hover:bg-gray-50 disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-gray-100 px-4 py-3">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="mt-0.5 text-xs text-gray-400">{label}</div>
    </div>
  );
}
