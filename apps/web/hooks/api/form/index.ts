import { trpc } from "~/trpc/client";


// ==================== Form Builder — list current user's forms ====================
//
// Backs the "Load Form" dialog in the form-builder.
// Returns every form owned by the current user (ownership enforced server-side).
//
export const useGetAllMyForms = () => {
    const {
        data,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.form.getAllMyForms.useQuery({});

    return {
        forms: data?.forms,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};


// ==================== Form Builder — load one form for editing ====================
//
// Backs the main editor view at /form/builder/[id].
// Returns the form's `draft` jsonb (not `published`) so the builder can edit it.
// Ownership-checked server-side — a user can never load another user's form.
//
// Pass `formId` from the route param. The query stays disabled until formId is set,
// which prevents firing a request during SSR / before the route param resolves.
//
export const useGetMyFormById = (formId: string) => {
    const {
        data: form,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.form.getMyFormById.useQuery(
        { formId },
        { enabled: !!formId },
    );

    return {
        form,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};


// ==================== Form Builder — create a new (empty) form ====================
//
// Used by:
//   - The "Save Draft" flow when there is no formId yet (auto-create on first save).
//   - The "Use Template" flow on /templates which prompts for title + description
//     before redirecting into the builder.
//
// Returns the new formId and public_slug; the public_slug is also generated up-front
// by the server so the form is share-ready even before the first publish.
//
export const useCreateForm = () => {
    const utils = trpc.useUtils();

    const mutation = trpc.form.storeFormTitleAndDesriptionIntoDb.useMutation({
        onSuccess: () => {
            // Refresh the "my forms" list so the new form appears in the picker.
            utils.form.getAllMyForms.invalidate();
        },
    });

    return {
        createFormAsync: mutation.mutateAsync,
        createForm: mutation.mutate,
        isCreating: mutation.status === "pending",
        error: mutation.error,
        data: mutation.data,
    };
};


// ==================== Form Builder — save draft / publish / settings ====================
//
// Single mutation that handles BOTH content updates (draft/publish) AND
// form-level settings (isExpiry, responseLimit). Pass the fields you want to
// write and leave the rest undefined — the tri-state convention lets you
// "leave alone" (undefined), "clear" (null), or "set" (value).
//
// Used by:
//   - "Save Draft" header button → `{ formId, draft }`
//   - "Publish" header button   → `{ formId, publish }`
//   - Form settings dialog      → `{ formId, isExpiry, responseLimit }`
//
// The server returns the formId and public_slug on success.
//
export const useUpdateFormData = () => {
    const utils = trpc.useUtils();

    const mutation = trpc.form.updateFormDataIntoDb.useMutation({
        onSuccess: () => {
            utils.form.getAllMyForms.invalidate();
            utils.form.getMyFormById.invalidate();
            utils.form.getShareInfo.invalidate();
        },
    });

    return {
        updateFormDataAsync: mutation.mutateAsync,
        updateFormData: mutation.mutate,
        isUpdating: mutation.status === "pending",
        error: mutation.error,
        data: mutation.data,
    };
};


// ==================== Form Builder — soft delete ====================
//
// Marks a form as deleted (`isDeleted = true`). Ownership-checked server-side.
//
// Used by the dashboard's per-form "Delete" button. After success the dashboard
// query is invalidated so the card disappears.
//
export const useSoftDeleteForm = () => {
    const utils = trpc.useUtils();

    const mutation = trpc.form.softDeleteForm.useMutation({
        onSuccess: () => {
            utils.form.getAllMyForms.invalidate();
            utils.form.getMyFormById.invalidate();
            utils.form.getShareInfo.invalidate();
            utils.form.getFormAnalytics.invalidate();
            utils.form.getGlobalAnalytics.invalidate();
        },
    });

    return {
        softDeleteFormAsync: mutation.mutateAsync,
        softDeleteForm: mutation.mutate,
        isDeleting: mutation.status === "pending",
        error: mutation.error,
        data: mutation.data,
    };
};


// ==================== Public — fetch a form by public/unlisted slug ====================
//
// Used by the public form viewer at /form/[id]. No auth — the server's
// `showTheFormBySlug` is a `publicProcedure`. The folder is named [id] to
// match the protected side's [id] (Next.js disallows two different dynamic
// segment names at the same URL position), but the captured value is
// still a slug and the server resolves it against publicSlug OR unlistedSlug.
//
// Returns `null` for `published` and `null` for the form itself when:
//   - the slug doesn't exist (404 → page shows "Form not found")
//   - the form exists but has no `published` jsonb (page shows "Not published")
//
// The hook stays disabled until slug is set, so a transient / undefined
// route param doesn't fire a request.
//
export const useGetFormBySlug = (slug: string) => {
    const {
        data: form,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.form.showTheFormBySlug.useQuery(
        { slug },
        { enabled: !!slug },
    );

    return {
        form,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};


// ==================== Public — submit a form response ====================
//
// Used by the public form viewer's submit handler. Returns the new
// `submission_id` (uuid) on success.
//
// No cache invalidation needed — there's no list of submissions to refresh
// on the public side, and the form being filled is the one being submitted.
//
export const useSubmitForm = () => {
    const mutation = trpc.form.storeFormSubmissionIntoDb.useMutation();

    return {
        submitFormAsync: mutation.mutateAsync,
        submitForm: mutation.mutate,
        isSubmitting: mutation.status === "pending",
        error: mutation.error,
        data: mutation.data,
    };
};


// ==================== Form Builder — share info (slug + isPublished) ====================
//
// Backs the "Share" header button. Returns whether the form is published and its
// public slug (if any). The UI uses this to decide between:
//   - "Publish first to share" message (when isPublished === false)
//   - "Copy link" with the public URL (when isPublished === true)
//
// Ownership-checked server-side. Only fires when formId is truthy.
//
export const useGetShareInfo = (formId: string) => {
    const {
        data,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.form.getShareInfo.useQuery(
        { formId },
        { enabled: !!formId },
    );

    return {
        shareInfo: data,
        isPublished: data?.isPublished ?? false,
        publicSlug: data?.publicSlug ?? null,
        unlistedSlug: data?.unlistedSlug ?? null,
        shareTitle: data?.title ?? "",
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};


// ==================== Phase 8: Submissions + Analytics ====================
//
// All three are ownership-checked server-side. The hook stays disabled until
// formId is truthy so transient/undefined route params don't fire a request.


// useGetAllFormSubmissions — paginated list of submissions for one form
//
// Backs the responses table on /form/[id]/responses. Pagination is local:
// the consumer is responsible for `setPage` when the user clicks Next/Prev.
//
export const useGetAllFormSubmissions = (formId: string, page: number = 1, limit: number = 20) => {
    const {
        data,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.form.getAllFormSubmissions.useQuery(
        { formId, page, limit },
        { enabled: !!formId },
    );

    return {
        submissions: data?.submissions,
        pagination: data?.pagination,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};


// useGetFormAnalytics — per-form analytics (counts + field response stats)
//
// Backs the per-form analytics cards on /form/[id]/responses.
//
export const useGetFormAnalytics = (formId: string) => {
    const {
        data,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.form.getFormAnalytics.useQuery(
        { formId },
        { enabled: !!formId },
    );

    return {
        totalSubmissions: data?.totalSubmissions ?? 0,
        submissionsOverTime: data?.submissionsOverTime ?? [],
        fieldStats: data?.fieldStats ?? [],
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};


// useGetGlobalAnalytics — analytics across all forms owned by the current user
//
// Backs the global analytics page at /analytics. No formId — the server uses
// the session's userId. No `enabled` flag needed.
//
export const useGetGlobalAnalytics = () => {
    const {
        data,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    } = trpc.form.getGlobalAnalytics.useQuery({});

    return {
        totalForms: data?.totalForms ?? 0,
        totalSubmissions: data?.totalSubmissions ?? 0,
        submissionsOverTime: data?.submissionsOverTime ?? [],
        topForms: data?.topForms ?? [],
        recentSubmissions: data?.recentSubmissions ?? [],
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};
