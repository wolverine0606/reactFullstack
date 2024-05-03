import { object, string } from "yup";

const newUserSchema = object({
  name: string().required("name is missing"),
  email: string().email().required("email is missing"),
  password: string().required("password is missing"),
});

export default newUserSchema;
