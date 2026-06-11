// apps/web/components/form-renderer/FormRenderer.tsx
"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { PublicFieldInput } from "./inputs";
import { buildFormSchema } from "~/hooks/use-form-validation";
import { fromPayload } from "~/lib/form-builder/serialize";
import { packRows } from "~/lib/form-builder/pack-rows";
import { useStoreFormSubmissionIntoDb } from "~/hooks/api/form";
import { DEFAULT_THEME, isInputType, type Block, type FormTheme } from "~/lib/form-builder/schema";

interface FormRendererProps {
  shortId: string;
  title: string;
  description?: string | null;
  payload: unknown;
  mode?: "live" | "preview";
}

export function FormRenderer({
  shortId,
  title,
  description,
  payload,
  mode = "live",
}: FormRendererProps) {
  const { submitFormIntoDbAsync, status } = useStoreFormSubmissionIntoDb();
  const isSubmitting = status === "pending";

  const parsed = fromPayload(payload);
  const blocks: Block[] = parsed?.blocks ?? [];
  const theme: FormTheme = parsed?.theme ?? DEFAULT_THEME;

  // Only reserve/show cover space when a cover is actually rendered.
  const hasCover = theme.showCover && Boolean(theme.coverUrl);

  // Stable key so the effects below only re-run when the payload truly changes.
  const payloadKey = React.useMemo(() => JSON.stringify(payload), [payload]);

  // Visible (non-hidden) blocks → packed into rows for layout.
  const rows = React.useMemo(() => {
    const visible = blocks.filter((b) => !("hidden" in b && b.hidden));
    return packRows(visible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payloadKey]);

  const schema = React.useMemo(
    () => buildFormSchema(blocks),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [payloadKey],
  );

  const defaultValues = React.useMemo(() => {
    const values: Record<string, unknown> = {};
    for (const b of blocks) {
      if (!isInputType(b.type)) continue;
      if ("hidden" in b && b.hidden) continue;
      if (b.type === "checkboxes" || b.type === "multi_select") values[b.id] = [];
      else if ("defaultValue" in b && b.defaultValue !== undefined) values[b.id] = b.defaultValue;
    }
    return values;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payloadKey]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues });

  const [submitted, setSubmitted] = React.useState(false);

  // When the payload changes (e.g. switching forms or re-entering preview),
  // clear the submitted state and reset the form to fresh defaults.
  React.useEffect(() => {
    setSubmitted(false);
    reset(defaultValues);
  }, [payloadKey, reset, defaultValues]);

  const onSubmit = handleSubmit(async (data) => {
    if (mode === "preview") {
      setSubmitted(true);
      toast.info("Preview — response not saved");
      return;
    }
    try {
      await submitFormIntoDbAsync({
        shortId,
        data: data as Record<string, unknown>,
      });
      setSubmitted(true);
      reset();
      toast.success("Response submitted");
    } catch (err) {
      console.error("[form-submit] failed", err);
      toast.error("Failed to submit. Please try again.");
    }
  });

  if (submitted) {
    return (
      <div className="mx-auto mt-32 px-8 text-center" style={{ maxWidth: theme.pageWidth }}>
        <h1 className="text-3xl font-bold">Thank you!</h1>
        <p className="mt-2 opacity-70">Your response has been recorded.</p>
      </div>
    );
  }

  return (
    <>
      <link
        href={`https://fonts.googleapis.com/css2?family=${theme.font}:wght@400;500;600;700&display=swap`}
        rel="stylesheet"
      />
      <style>{`
                .public-form-input::placeholder {
                    color: ${theme.inputPlaceholderColor} !important;
                }
            `}</style>

      {/* Cover */}
      {hasCover && (
        <div
          className="w-full bg-cover"
          style={{
            height: theme.coverHeight,
            backgroundImage: `url(${theme.coverUrl})`,
            backgroundPosition: `center ${theme.coverPosition}`,
          }}
        />
      )}

      <form
        onSubmit={onSubmit}
        className="relative mx-auto px-8 pb-24"
        style={{
          maxWidth: theme.pageWidth,
          fontSize: theme.baseFontSize,
          // Use padding (not margin) so the top spacing doesn't margin-collapse
          // through the page wrapper and reveal the body background as a band.
          paddingTop: hasCover
            ? theme.showLogo
              ? `calc(${theme.logoHeight} / 2 + 16px)`
              : "0"
            : "5rem",
        }}
      >
        {/* Logo */}
        {theme.showLogo && (
          <div
            className={`${hasCover ? "absolute left-8 top-0 -translate-y-1/2" : "my-6"} flex items-center`}
          >
            <div
              className="flex items-center justify-center overflow-hidden shadow-md"
              style={{
                width: theme.logoWidth,
                height: theme.logoHeight,
                borderRadius: theme.logoRadius,
                backgroundColor: theme.logoBgColor,
              }}
            >
              {theme.logoUrl ? (
                <img
                  src={theme.logoUrl}
                  alt="Logo"
                  className="h-full w-full object-cover"
                  style={{ borderRadius: theme.logoRadius }}
                />
              ) : (
                <span className="text-2xl font-bold text-white">✦</span>
              )}
            </div>
          </div>
        )}

        <h1 className="text-4xl font-bold">{title}</h1>
        {description && <p className="mt-3 opacity-70">{description}</p>}

        <div className="mt-10 flex flex-col gap-5">
          {rows.map((row) => (
            <div key={row.id} className="flex flex-col gap-4 sm:flex-row sm:gap-4">
              {row.blocks.map((block) => (
                <div
                  key={block.id}
                  className="min-w-0"
                  style={{ flexBasis: `${block.width * 100}%`, flexGrow: 0, flexShrink: 0 }}
                >
                  <BlockField
                    block={block}
                    control={control}
                    error={errors[block.id]?.message as string | undefined}
                    theme={theme}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent:
              theme.btnAlignment === "center"
                ? "center"
                : theme.btnAlignment === "right"
                  ? "flex-end"
                  : "flex-start",
            marginTop: theme.btnVerticalMargin,
            marginBottom: theme.btnVerticalMargin,
          }}
        >
          <Button
            type="submit"
            disabled={isSubmitting}
            style={{
              backgroundColor: theme.btnBgColor,
              color: theme.btnTextColor,
              width: theme.btnWidth,
              height: theme.btnHeight,
              fontSize: theme.btnFontSize,
              borderRadius: theme.btnCornerRadius,
              paddingLeft: theme.btnHorizontalPadding,
              paddingRight: theme.btnHorizontalPadding,
              border: "none",
            }}
          >
            {isSubmitting ? "Submitting…" : "Submit"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </>
  );
}

/* ---- Renders a single block: layout (static) or input (controlled) ---- */

function BlockField({
  block,
  control,
  error,
  theme,
}: {
  block: Block;
  control: ReturnType<typeof useForm>["control"];
  error?: string;
  theme: FormTheme;
}) {
  // Layout blocks
  if (block.type === "heading_1") return <h2 className="text-3xl font-bold">{block.content}</h2>;
  if (block.type === "heading_2") return <h3 className="text-2xl font-bold">{block.content}</h3>;
  if (block.type === "heading_3") return <h4 className="text-xl font-bold">{block.content}</h4>;
  if (block.type === "text") return <p className="leading-relaxed opacity-80">{block.content}</p>;
  if (block.type === "divider") return <hr className="border-current/20" />;

  // Past here it's an input block. `'required' in block` narrows to the input union.
  if (!("required" in block)) return null;

  return (
    <div className="flex flex-col gap-2" style={{ marginBottom: theme.inputMarginBottom }}>
      <label className="flex items-center gap-1 font-medium">
        {block.label || <span className="opacity-50">Untitled question</span>}
        {block.required && <span className="text-red-500">*</span>}
      </label>
      {block.description && <p className="text-sm opacity-50">{block.description}</p>}
      <Controller
        name={block.id}
        control={control}
        render={({ field: controller }) => (
          <PublicFieldInput block={block} controller={controller} theme={theme} />
        )}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
