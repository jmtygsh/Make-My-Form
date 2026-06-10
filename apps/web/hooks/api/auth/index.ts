// /apps/web/hooks/api/auth/index.ts
import { trpc } from "~/trpc/client";

export const useSignUp = () => {
  // refresh useUser again if sign up is complete (may be your cache is not updated so, refresh it) tell to useUser hook
  const utils = trpc.useUtils();

  const {
    mutateAsync: createUserWithEmailAndPasswordAsync,
    mutate: createUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.createUserWithEmailAndPassword.useMutation({
    // hook for useUser to refresh user info
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
  });

  return {
    createUserWithEmailAndPasswordAsync,
    createUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useSignIn = () => {
  // refresh useUser again if sign up is complete (may be your cache is not updated so, refresh it) tell to useUser hook
  const utils = trpc.useUtils();

  const {
    mutateAsync: signInUserWithEmailAndPasswordAsync,
    mutate: signInUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.signInUserWithEmailAndPassword.useMutation({
    // hook for useUser to refresh user info
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
  });

  return {
    signInUserWithEmailAndPasswordAsync,
    signInUserWithEmailAndPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useForgotPassword = () => {
  const {
    mutateAsync: forgotPasswordAsync,
    mutate: forgotPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.forgetPassword.useMutation();

  return {
    forgotPasswordAsync,
    forgotPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useResetPassword = () => {
  const {
    mutateAsync: resetPasswordAsync,
    mutate: resetPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.resetPassword.useMutation();

  return {
    resetPasswordAsync,
    resetPassword,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useVerifyUserEmailWithToken = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: verifyUserEmailWithTokenAsync,
    mutate: verifyUserEmailWithToken,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.verifyUserEmailWithToken.useMutation({
    // invalidate user cache since email verification changes user state
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
  });

  return {
    verifyUserEmailWithTokenAsync,
    verifyUserEmailWithToken,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useLogout = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: logout,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
  });

  return {
    logout,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};

export const useMe = () => {
  const {
    data: user,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  } = trpc.auth.getLoggedInUserInfo.useQuery({});
  return {
    user,
    error,
    isFetched,
    isFetching,
    isLoading,
    status,
  };
};

export const useUpdateUser = () => {
  const utils = trpc.useUtils();

  const {
    mutateAsync: updateUserAsync,
    mutate: updateUser,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  } = trpc.auth.updateUser.useMutation({
    // invalidate user cache since profile update changes user state
    onSuccess: async () => {
      await utils.auth.getLoggedInUserInfo.invalidate();
    },
  });

  return {
    updateUserAsync,
    updateUser,
    error,
    failureCount,
    isError,
    isIdle,
    isSuccess,
    status,
  };
};
