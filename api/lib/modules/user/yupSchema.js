import * as yup from "yup";
import whitelist from "../../config/whitelist.json";
import schools from "../../config/schools.json";

const userSchema = yup.object({
  name: yup.string().required().trim().min(3),
  yearGroup: yup.string().required().oneOf(Object.keys(whitelist.year)),
  biography: yup.string().trim(),
  school: yup
    .string()
    .required()
    .when("yearGroup", {
      is: (val) => whitelist.year[val],
      then: (schema) =>
        schema.oneOf(
          schools.filter((s) => s.type === "Tertiary").map((s) => s.name)
        ),
      otherwise: (schema) =>
        schema.oneOf(
          schools.filter((s) => s.type === "Secondary").map((s) => s.name)
        ),
    }),
  applyTutor: yup.boolean().default(false),
  tutor: yup.object().when("applyTutor", {
    is: true,
    then: (schema) =>
      schema.shape({
        academicsTutoring: yup
          .array()
          .of(yup.string().oneOf(whitelist.academic)),
        curricula: yup.array().of(yup.string().oneOf(whitelist.curricula)),
        price: yup.number().required().integer().min(0).max(100),
        online: yup.boolean().required(),
        location: yup
          .string()
          .oneOf([...whitelist.location, null]) // yup verbosity
          .nullable(),
        academicRecords: yup.array(),
      }),
    otherwise: (schema) => schema.nullable(),
  }),
});

export default userSchema;
