import { Types, isValidObjectId } from "mongoose";
import { addMethod, object, string } from "yup";

const passRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

addMethod(string, "email", function validateEmail(message) {
  return this.matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message,
    name: "email",
    excludeEmptyString: true,
  });
});

export const newUserSchema = object({
  name: string().required("name is missing"),
  email: string().email("invalid email!!!!!").required("email is missing"),
  password: string()
    .required("password is missing")
    .min(8, "password must be at least 8 characters long")
    .matches(passRegex, {
      message:
        "password is too weak. it must contain upper and lowercase, special character and number",
    }),
});

export const verifyTokenSchema = object({
  id: string().test({
    name: "valid-id",
    message: "Invalid user id",
    test: (value) => {
      return isValidObjectId(value);
    },
  }),
  token: string().required("token is missing"),
});
