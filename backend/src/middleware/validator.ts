import { RequestHandler } from "express";
import { sendErrorRes } from "../utils/helper";
import { Schema, ValidationError } from "yup";

const validate = (schema: Schema): RequestHandler => {
  return async (req, res, next) => {
    try {
      await schema.validate(
        { ...req.body },
        { strict: true, abortEarly: true }
      );
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        sendErrorRes(res, err.message, 422);
      } else {
        next(err);
      }
    }
  };
};

export default validate;
