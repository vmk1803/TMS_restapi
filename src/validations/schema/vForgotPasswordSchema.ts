import { email, InferOutput, nonEmpty, object, pipe, string } from "valibot";
import { EMAIL_INVALID, EMAIL_MISSING } from "../../constants/appMessages";

export const VForgotPasswordSchema = object({
  email: pipe(
    string(EMAIL_MISSING),
    nonEmpty(EMAIL_MISSING),
    email(EMAIL_INVALID)
  ),

});

export type ValidatedForgotPassword = InferOutput<typeof VForgotPasswordSchema>;