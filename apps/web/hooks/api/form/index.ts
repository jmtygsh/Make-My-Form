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
