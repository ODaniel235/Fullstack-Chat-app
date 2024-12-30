import { z } from "zod";
const emailSchema = z.string().email({ message: "Invalid email address" });
const firstnameSchema = z
  .string()
  .min(3, { message: "First Name is too short" })
  .max(40, { message: "First Name cannot be longer than 40 characters" });
const lastnameSchema = z
  .string()
  .min(3, { message: "Last Name is too short" })
  .max(40, { message: "Last Name cannot be longer than 40 characters" });
const passwordSchema = z
  .string()
  .min(8, { message: "Password should be more than 8 characters" })
  .max(40, { message: "Password cannot be longer than 40 characters" });
const authSchema = z.object({
  firstname: firstnameSchema,
  lastname: lastnameSchema,
  email: emailSchema,
  password: passwordSchema,
});
const loginAuthSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
export { authSchema, loginAuthSchema };
