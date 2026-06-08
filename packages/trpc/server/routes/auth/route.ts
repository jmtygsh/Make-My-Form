import { userService } from "../../services";
import {
  createUserWithEmailAndPasswordInputModel,
  createUserWithEmailAndPasswordOutputModel,
  forgetPasswordInputModel,
  forgetPasswordOutputModel,
  getLoggerInUserInfoInputModel,
  getLoggerInUserInfoOutput,
  signInUserWithEmailAndPasswordInputModel,
  signInUserWithEmailAndPasswordOutputModel,
  verifyUserEmailWithTokenInputModel,
  verifyUserEmailWithTokenOutputModel,
  resetPasswordInputModel,
  resetPasswordOutputModel,
  updateUserInputModel,
  updateUserOutputModel,
  logoutInputModel,
  logoutOutputModel
} from "./model";

import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { clearAuthenticationCookie, getAuthenticationCookie, setAuthenticationCookie } from "../../utils/cookie";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({

  createUserWithEmailAndPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/create-user-with-email-and-password"), tags: TAGS } })
    .input(createUserWithEmailAndPasswordInputModel)
    .output(createUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { fullName, email, password } = input;
      const { id, token } = await userService.createUserWithEmailAndPassword({ fullName, email, password });

      // set cookie with auth token
      setAuthenticationCookie(ctx, token)

      return {
        id
      };
    }),


  signInUserWithEmailAndPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/sign-in-user-with-email-and-password"), tags: TAGS } })
    .input(signInUserWithEmailAndPasswordInputModel)
    .output(signInUserWithEmailAndPasswordOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { email, password } = input;
      const { id, token } = await userService.signInUserWithEmailAndPassword({ email, password });

      // set cookie with auth token
      setAuthenticationCookie(ctx, token)

      return {
        id
      };
    }),


  getLoggedInUserInfo: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/get-logged-in-user-info"), tags: TAGS } })
    .input(getLoggerInUserInfoInputModel)
    .output(getLoggerInUserInfoOutput)
    .query(async ({ ctx }) => {
      const { id, email, fullName, profileImageUrl } = ctx.user;
      return {
        id,
        email,
        fullName,
        profileImageUrl
      };
    }),



  verifyUserEmailWithToken: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/verify-user-email-with-token"), tags: TAGS } })
    .input(verifyUserEmailWithTokenInputModel)
    .output(verifyUserEmailWithTokenOutputModel)
    .mutation(async ({ input }) => {
      const { id } = await userService.verifyUserEmailWithToken({ token: input.token });
      return {
        id
      };
    }),


  forgetPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/forget-password"), tags: TAGS } })
    .input(forgetPasswordInputModel)
    .output(forgetPasswordOutputModel)
    .mutation(async ({ input }) => {
      const { id } = await userService.forgetPassword({ email: input.email });
      return {
        id
      };
    }),

  resetPassword: publicProcedure
    .meta({ openapi: { method: "POST", path: getPath("/reset-password"), tags: TAGS } })
    .input(resetPasswordInputModel)
    .output(resetPasswordOutputModel)
    .mutation(async ({ input }) => {
      const { id } = await userService.setNewPasswordForEmailUser({
        token: input.token,
        password: input.password
      });
      return {
        id
      };
    }),


  updateUser: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/update-user"), tags: TAGS } })
    .input(updateUserInputModel)
    .output(updateUserOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { fullName, profileImageUrl } = input;
      const updated = await userService.updateUser({ id: ctx.user.id, fullName, profileImageUrl });
      return updated;
    }),


  logout: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath("/logout"), tags: TAGS } })
    .input(logoutInputModel)
    .output(logoutOutputModel)
    .mutation(async ({ ctx }) => {

      clearAuthenticationCookie(ctx);
      return {
        message: "LOGGED_OUT"
      };
    }),


});
