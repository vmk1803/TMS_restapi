import { array, minLength, nonEmpty, object, pipe, string, InferOutput, nullish } from "valibot";
import {
  GROUP_DEPARTMENT_INVALID,
  GROUP_DEPARTMENT_REQUIRED,
  GROUP_MANAGER_INVALID,
  GROUP_MANAGER_REQUIRED,
  GROUP_MEMBERS_INVALID,
  GROUP_MEMBERS_MIN_LENGTH,
  GROUP_MEMBERS_REQUIRED,
  GROUP_NAME_INVALID,
  GROUP_NAME_MIN_LENGTH,
  GROUP_NAME_REQUIRED
} from "../../constants/appMessages";

const VGroupSchema = object({
  name: pipe(
    string(GROUP_NAME_INVALID),
    nonEmpty(GROUP_NAME_REQUIRED),
    minLength(3, GROUP_NAME_MIN_LENGTH)
  ),
  department: pipe(
    string(GROUP_DEPARTMENT_INVALID),
    nonEmpty(GROUP_DEPARTMENT_REQUIRED)
  ),
  manager: pipe(
    string(GROUP_MANAGER_INVALID),
    nonEmpty(GROUP_MANAGER_REQUIRED)
  ),
  members: pipe(
    array(string(GROUP_MEMBERS_INVALID)),
    minLength(1, GROUP_MEMBERS_MIN_LENGTH)
  ),
  description: nullish(
    string(),
    null
  )
});

const VUpdateGroupSchema = object({
  name: nullish(
    pipe(
      string(GROUP_NAME_INVALID),
      minLength(3, GROUP_NAME_MIN_LENGTH)
    )
  ),
  department: nullish(
    string(GROUP_DEPARTMENT_INVALID)
  ),
  manager: nullish(
    string(GROUP_MANAGER_INVALID)
  ),
  members: nullish(
    array(string(GROUP_MEMBERS_INVALID))
  ),
  description: nullish(
    string(),
    null
  )
});

export { VGroupSchema, VUpdateGroupSchema };

export type ValidatedGroup = InferOutput<typeof VGroupSchema>;
export type ValidatedUpdateGroup = InferOutput<typeof VUpdateGroupSchema>;
