import { boolean, email, forward, InferOutput, intersect, minLength, nonEmpty, nullish, object, partialCheck, pipe, pipeAsync, rawTransformAsync, string, value, enum as _enum } from "valibot";
import { CURRENT_PASSWORD_REQUIRED, CURRENT_PASSWORD_STRING, DESIGNATION_INVALID, DESIGNATION_MIN_LENGTH, EMAIL_EXISTS, EMAIL_INVALID, EMAIL_MISSING, FIRST_NAME_INVALID, FIRST_NAME_MISSING, FIRST_NAME_TOO_SHORT, LAST_NAME_INVALID, LAST_NAME_MISSING, LAST_NAME_TOO_SHORT, MIDDLE_NAME_INVALID, PASSWORD_INVALID, PASSWORD_MISSING, PASSWORD_SHORT, PASSWORDS_NOT_MATCHING, PROFILE_PIC_INVALID, PROFILE_PIC_MISSING, PROFILE_PIC_TOO_SHORT, USER_ACTIVE_STATUS_REQUIRED, USER_TYPE_INVALID, USER_TYPE_MISSING } from "../../constants/appMessages";
import { userEmailExists } from "../customValidations";
import { prepareValibotIssue } from "../prepareValibotIssue";

enum USER_TYPE {
  ADMIN = 'admin',
  USER = 'user',
  SUPER_ADMIN = 'super_admin'
}
const VUserSchema = object({
  fname: pipe(
    string(FIRST_NAME_INVALID),
    nonEmpty(FIRST_NAME_MISSING),
    minLength(3, FIRST_NAME_TOO_SHORT)
  ),

  lname: pipe(
    string(LAST_NAME_INVALID),
    nonEmpty(LAST_NAME_MISSING),
    minLength(1, LAST_NAME_TOO_SHORT)
  ),

  mname: nullish(
    string(MIDDLE_NAME_INVALID),
    null
  ),


  email: pipe(
    string(EMAIL_INVALID),
    nonEmpty(EMAIL_MISSING),
    email(EMAIL_INVALID)
  ),

  password: pipe(
    string(PASSWORD_INVALID),
    nonEmpty(PASSWORD_MISSING),
    minLength(8, PASSWORD_SHORT)
  ),

  profile_pic: nullish(
    string(PROFILE_PIC_INVALID),
    null
  ),
  phone_number: nullish(
    string(),
    null
  ),
  designation: nullish(
    pipe(
      string(DESIGNATION_INVALID),
      minLength(2, DESIGNATION_MIN_LENGTH),
    ),
    null
  ),
})

export const VAdminUserSchema = pipeAsync(
  intersect(
    [
      VUserSchema,
      object({
        user_type: pipe(
          string(USER_TYPE_INVALID),
          nonEmpty(USER_TYPE_MISSING),
          value('admin', USER_TYPE_INVALID),
        )
      })
    ]
  ),
  rawTransformAsync(async ({ dataset, addIssue, NEVER }) => {
    if (dataset.value.email) {
      let { email } = dataset.value
      if (await userEmailExists(email)) {
        prepareValibotIssue(dataset, addIssue, 'email', email, EMAIL_EXISTS)
      }
    }
    return dataset.value
  })
)

export const VRegularUserSchema = pipeAsync(
  intersect(
    [
      VUserSchema,
      object({
        user_type: pipe(
          string(USER_TYPE_INVALID),
          nonEmpty(USER_TYPE_MISSING),
          value('user', USER_TYPE_INVALID),
        )
      })
    ]
  ),
  rawTransformAsync(async ({ dataset, addIssue, NEVER }) => {
    if (dataset.value.email) {
      let { email } = dataset.value
      if (await userEmailExists(email)) {
        prepareValibotIssue(dataset, addIssue, 'email', email, EMAIL_EXISTS)
      }
    }
    return dataset.value
  })
)

const VPasswordSchema = object({
  new_password: pipe(
    string(),
    nonEmpty(PASSWORD_INVALID),
    minLength(8, PASSWORD_SHORT)
  ),
  confirm_new_password: string()
})

export const VUpdatePasswordSchema = pipe(
  intersect([
    VPasswordSchema,
    object({
      current_password: pipe(
        string(CURRENT_PASSWORD_STRING),
        nonEmpty(CURRENT_PASSWORD_REQUIRED),
      )

    })
  ]),
  forward(
    partialCheck(
      [['new_password'], ['confirm_new_password']],
      (input: any) => input.new_password === input.confirm_new_password,
      PASSWORDS_NOT_MATCHING
    ),
    ['confirm_new_password']
  )
)

export const VResetPasswordSchema = pipe(
  intersect(
    [
      VPasswordSchema,
      object({
        reset_password_token: string()
      })
    ]
  ),
  forward(
    partialCheck(
      [['new_password'], ['confirm_new_password']],
      (input: any) => input.new_password === input.confirm_new_password,
      PASSWORDS_NOT_MATCHING
    ),
    ['confirm_new_password']
  )
)

export const
  VUpdateUserSchema = object({
    fname: pipe(
      string(FIRST_NAME_INVALID),
      nonEmpty(FIRST_NAME_MISSING),
      minLength(3, FIRST_NAME_TOO_SHORT)
    ),

    lname: pipe(
      string(LAST_NAME_INVALID),
      nonEmpty(LAST_NAME_MISSING),
      minLength(1, LAST_NAME_TOO_SHORT)
    ),

    mname: nullish(
      string(MIDDLE_NAME_INVALID),
      null
    ),

    email: pipe(
      string(EMAIL_INVALID),
      nonEmpty(EMAIL_MISSING),
      email(EMAIL_INVALID)
    ),
    phone_number: nullish(
      string(),
      null
    ),
    designation: nullish(
      string(DESIGNATION_INVALID),
      null
    ),
    user_type: pipe(
      string(USER_TYPE_INVALID),
      nonEmpty(USER_TYPE_MISSING),
      _enum(USER_TYPE, USER_TYPE_INVALID)
    )

  });

export const
  VUpdateUserStatusSchema = object({
    active: boolean(USER_ACTIVE_STATUS_REQUIRED)
  });


export const
  VUpdateUserProfilePicSchema = object({
    profile_pic: pipe(
      string(PROFILE_PIC_INVALID),
      nonEmpty(PROFILE_PIC_MISSING),
      minLength(5, PROFILE_PIC_TOO_SHORT)
    )
  });


export const VResetPasswordByAdminSchema = object({
  new_password: pipe(
    string(),
    nonEmpty(PASSWORD_INVALID),
    minLength(6, PASSWORD_SHORT)
  )
})

export const VAddUserSchema = object({
  fname: pipe(
    string(FIRST_NAME_INVALID),
    nonEmpty(FIRST_NAME_MISSING),
    minLength(3, FIRST_NAME_TOO_SHORT)
  ),

  lname: pipe(
    string(LAST_NAME_INVALID),
    nonEmpty(LAST_NAME_MISSING),
    minLength(1, LAST_NAME_TOO_SHORT)
  ),

  mname: nullish(
    string(MIDDLE_NAME_INVALID),
    null
  ),


  email: pipe(
    string(EMAIL_INVALID),
    nonEmpty(EMAIL_MISSING),
    email(EMAIL_INVALID)
  ),

  password: pipe(
    string(PASSWORD_INVALID),
    nonEmpty(PASSWORD_MISSING),
    minLength(8, PASSWORD_SHORT)
  ),

  profile_pic: nullish(
    string(PROFILE_PIC_INVALID),
    null
  ),
  phone_number: nullish(
    string(),
    null
  ),
  designation: nullish(
    string(DESIGNATION_INVALID),
    null
  ),
  user_type: pipe(
    string(USER_TYPE_INVALID),
    nonEmpty(USER_TYPE_MISSING),
    _enum(USER_TYPE, USER_TYPE_INVALID)
  )
})

export type ValidatedAdminUser = InferOutput<typeof VAdminUserSchema>
export type ValidatedRegularUser = InferOutput<typeof VRegularUserSchema>
export type ValidatedUser = ValidatedAdminUser | ValidatedRegularUser
export type ValidatedAddUser = InferOutput<typeof VAddUserSchema>

export type ValidatedUpdatePassword = InferOutput<typeof VUpdatePasswordSchema>
export type ValidatedResetPassword = InferOutput<typeof VResetPasswordSchema>
export type ValidatedResetPasswordByAdmin = InferOutput<typeof VResetPasswordByAdminSchema>
export type ValidatedPasswordChange = ValidatedUpdatePassword | ValidatedResetPassword | ValidatedResetPasswordByAdmin

export type ValidatedUpdateUser = InferOutput<typeof VUpdateUserSchema>;

export type ValidatedUpdateUserStatus = InferOutput<typeof VUpdateUserStatusSchema>;

export type ValidatedUpdateUserProfilePic = InferOutput<typeof VUpdateUserProfilePicSchema>;
