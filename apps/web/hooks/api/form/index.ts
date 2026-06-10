import { trpc } from "~/trpc/client";
import { keepPreviousData } from "@tanstack/react-query";

export const useStoreDraftFormIntoDb = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: storeDraftFormAsync,
    mutate: storeDraftForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.storeDraftFormIntoDb.useMutation({
    onSuccess: async () => {
      await utils.form.getAllMyForms.invalidate(); // invalidate the list of forms to reflect the new draft
    },
  });

  return {
    storeDraftFormAsync: storeDraftFormAsync,
    storeDraftForm: storeDraftForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useStorePublishFormIntoDb = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: storePublishFormAsync,
    mutate: storePublishForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.storePublishFormIntoDb.useMutation({
    onSuccess: async () => {
      await utils.form.getAllMyForms.invalidate(); // invalidate the list of forms to reflect the new draft
    },
  });

  return {
    storePublishFormAsync: storePublishFormAsync,
    storePublishForm: storePublishForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useUpdateFormSettingIntoDb = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: updateFormSettingAsync,
    mutate: updateFormSetting,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.updateFormSettingIntoDb.useMutation({
    onSuccess: async () => {
      await utils.form.getAllMyForms.invalidate(); // invalidate the list of forms to reflect the updated settings
    },
  });

  return {
    updateFormSettingAsync: updateFormSettingAsync,
    updateFormSetting: updateFormSetting,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useSoftDeleteForm = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: softDeleteFormAsync,
    mutate: softDeleteForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.softDeleteForm.useMutation({
    onSuccess: async () => {
      await utils.form.getAllMyForms.invalidate(); // invalidate the list of forms to reflect the deleted form
    },
  });

  return {
    softDeleteFormAsync: softDeleteFormAsync,
    softDeleteForm: softDeleteForm,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useStoreFormSubmissionIntoDb = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: submitFormIntoDbAsync,
    mutate: submitFormIntoDb,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.form.storeFormSubmissionIntoDb.useMutation({
    onSuccess: async () => {
      await utils.form.getAllFormSubmissions.invalidate(); // invalidate the list of submissions to reflect the new submission
    },
  });

  return {
    submitFormIntoDbAsync: submitFormIntoDbAsync,
    submitFormIntoDb: submitFormIntoDb,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useGetMyFormById = (shortId: string) => {
  const {
    data: form,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.getMyFormById.useQuery({ shortId }, { enabled: !!shortId });

  return {
    form,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
};

export const useGetPublicFormById = (shortId: string) => {
  const {
    data: form,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.getPublicFormById.useQuery({ shortId }, { enabled: !!shortId });

  return {
    form,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
};

export const useGetAllMyForms = (page: number, limit: number) => {
  const {
    data: forms,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.getAllMyForms.useQuery(
    { page, limit },
    {
      enabled: page > 0 && limit > 0,
      placeholderData: keepPreviousData, // keep previous page while loading next
    },
  );

  return { forms, error, isFetched, isFetching, isLoading, status };
};

export const useGetAllFormSubmissions = (shortId: string, page: number, limit: number) => {
  const {
    data: submissions,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.form.getAllFormSubmissions.useQuery(
    { shortId, page, limit },
    { enabled: !!shortId && page > 0 && limit > 0 },
  );
  return {
    submissions,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
};
