import { RequestHandler } from "express";
import blacklistModel from "../models/blacklist";

const isInBlackList: RequestHandler = async (req, res, next) => {
  const email = req.body.email;

  const inBlackList = await blacklistModel.findOne({ email });
  if (inBlackList) {
    return res.status(403).json({
      message: "user is in the blacklist",
    });
  }
  next();
};

export default isInBlackList;
