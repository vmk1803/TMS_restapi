import { email, InferOutput, nonEmpty, object, pipe, string } from "valibot";
import { EMAIL_INVALID, EMAIL_MISSING, PASSWORD_INVALID, PASSWORD_REQUIRED } from "../../constants/appMessages";

export const VLoginSchema = object({
  email: pipe(
    string(EMAIL_INVALID),
    nonEmpty(EMAIL_MISSING),
    email(EMAIL_INVALID)
  ),

  password: pipe(
    string(PASSWORD_INVALID),
    nonEmpty(PASSWORD_REQUIRED),
  )
});

export type ValidatedLogin = InferOutput<typeof VLoginSchema>;