import * as yup from "yup";

const userSchema = yup.object().shape({
  name: yup.string().min(3),
  email: yup.string().lowercase().email(),
  yearGroup: yup.number().positive().integer(),
  school: yup.string().min(3),
  biography: yup.string().min(2),
  academics: yup.array().of(yup.string().min(3)),
  extras: yup.array().of(yup.string().min(3)),
});

export default userSchema;
