import { Router } from "express";
import { createNewUser } from "../controllers/auth";
import validate from "../middleware/validator";
import newUserSchema from "../utils/schemas/user-schema";

const authRouter = Router();
authRouter.post("/sign-up");
authRouter.post("/sign-in", validate(newUserSchema), createNewUser);
authRouter.post("verify");
authRouter.post("/refresh-token");

export default authRouter;
