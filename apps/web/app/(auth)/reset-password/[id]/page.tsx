import { ResetPasswordForm } from "~/components/auth/reset-password-form";

export default function ResetPasswordPage({
  params,
}: {
  params: { id: string };
}) {
  return <ResetPasswordForm id={params.id} />;
}