// apps/web/hooks/api/form/index.ts

import { trpc } from '~/trpc/client';

// ==================== Builder — list current user's forms ====================
//
// Paginated list of forms owned by the current user. Backs the dashboard.
// Ownership is enforced server-side from the session user.
//
export const useGetAllMyForms = (page: number = 1, limit: number = 10) => {
    const { data, error, isFetched, isFetching, isLoading, status } =
        trpc.form.getAllMyForms.useQuery({ page, limit });

    return {
        forms: data?.forms,
        pagination: data?.pagination,
        error,
        isFetched,
        isFetching,
        isLoading,
        status,
    };
};

// ==================== Public — load one form for viewing ====================
//
// Resolves by the frontend-generated `shortId` used in the public `/form/[id]`
// route. Excludes deleted forms server-side. Stays disabled until `shortId`
// is set so a transient route param doesn't fire a request.
//
export const useGetFormBySlug = (shortId: string) => {
    const { data: form, error, isFetched, isFetching, isLoading, status } =
        trpc.form.getPublicFormById.useQuery(
            { shortId },
            { enabled: !!shortId },
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

// ==================== Builder — load one form for editing ====================
//
// Resolves by the frontend-generated `shortId` (the value in the route).
// Returns both `draft` and `published` jsonb so the builder can hydrate from
// whichever is present. Ownership-checked server-side. Stays disabled until
// `shortId` is set so a transient route param doesn't fire a request.
//
export const useGetMyFormById = (shortId: string) => {
    const { data: form, error, isFetched, isFetching, isLoading, status } =
        trpc.form.getMyFormById.useQuery(
            { shortId },
            { enabled: !!shortId },
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

// ==================== Builder — save draft (upsert by shortId) ====================
//
// First save inserts the row; later saves update the draft column only.
// Refreshes the dashboard list and the loaded-form cache on success.
//
export const useStoreDraftForm = () => {
    const utils = trpc.useUtils();

    const mutation = trpc.form.storeDraftFormIntoDb.useMutation({
        onSuccess: () => {
            utils.form.getAllMyForms.invalidate();
            utils.form.getMyFormById.invalidate();
        },
    });

    return {
        storeDraftAsync: mutation.mutateAsync,
        storeDraft: mutation.mutate,
        isSaving: mutation.status === 'pending',
        error: mutation.error,
        data: mutation.data,
    };
};

// ==================== Builder — publish (upsert by shortId) ====================
//
// Writes the published payload + flips status to "published". Leaves the draft
// untouched so the user can keep editing after publishing.
//
export const useStorePublishForm = () => {
    const utils = trpc.useUtils();

    const mutation = trpc.form.storePublishFormIntoDb.useMutation({
        onSuccess: () => {
            utils.form.getAllMyForms.invalidate();
            utils.form.getMyFormById.invalidate();
        },
    });

    return {
        storePublishAsync: mutation.mutateAsync,
        storePublish: mutation.mutate,
        isPublishing: mutation.status === 'pending',
        error: mutation.error,
        data: mutation.data,
    };
};

// ==================== Settings — update form-level settings ====================
//
// Tri-state: only the fields you pass are written (visibility, responseLimit,
// isExpiry). Used by the settings page's visibility toggle, expiry, and limit.
//
export const useUpdateFormSetting = () => {
    const utils = trpc.useUtils();

    const mutation = trpc.form.updateFormSettingIntoDb.useMutation({
        onSuccess: () => {
            utils.form.getAllMyForms.invalidate();
            utils.form.getMyFormById.invalidate();
        },
    });

    return {
        updateSettingAsync: mutation.mutateAsync,
        updateSetting: mutation.mutate,
        isUpdating: mutation.status === 'pending',
        error: mutation.error,
        data: mutation.data,
    };
};

// ==================== Dashboard — soft delete ====================
//
// Marks a form deleted (`isDeleted = true`). Ownership-checked server-side.
// Submissions are kept. Takes the internal form UUID (`id`), not the shortId.
//
export const useSoftDeleteForm = () => {
    const utils = trpc.useUtils();

    const mutation = trpc.form.softDeleteForm.useMutation({
        onSuccess: () => {
            utils.form.getAllMyForms.invalidate();
            utils.form.getMyFormById.invalidate();
        },
    });

    return {
        softDeleteFormAsync: mutation.mutateAsync,
        softDeleteForm: mutation.mutate,
        isDeleting: mutation.status === 'pending',
        error: mutation.error,
        data: mutation.data,
    };
};

// ==================== Settings — list submissions for one form ====================
//
// Paginated submissions for a single form, by `shortId`. Ownership-checked
// server-side. Pagination is local — the consumer drives `page`.
//
export const useGetAllFormSubmissions = (
    shortId: string,
    page: number = 1,
    limit: number = 20,
) => {
    const { data, error, isFetched, isFetching, isLoading, status } =
        trpc.form.getAllFormSubmissions.useQuery(
            { shortId, page, limit },
            { enabled: !!shortId },
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

// ==================== Public — submit a form response ====================
//
// Used by the public form viewer. Submits by `shortId`. No cache invalidation.
//
export const useSubmitForm = () => {
    const mutation = trpc.form.storeFormSubmissionIntoDb.useMutation();

    return {
        submitFormAsync: mutation.mutateAsync,
        submitForm: mutation.mutate,
        isSubmitting: mutation.status === 'pending',
        error: mutation.error,
        data: mutation.data,
    };
};
