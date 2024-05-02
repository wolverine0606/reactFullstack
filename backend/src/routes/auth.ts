import { Router } from "express";
import { createNewUser } from "../controllers/auth";

const authRouter = Router();
authRouter.post("/sign-up");
authRouter.post("/sign-in", createNewUser);
authRouter.post("verify");
authRouter.post("/refresh-token");

export default authRouter;
