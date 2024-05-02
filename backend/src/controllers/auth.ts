import { RequestHandler } from "express";

export const createNewUser: RequestHandler = (req, res) => {
  const { email, password, name } = req.body;
  if (!name) return res.status(422).json({ message: "name is missing" });
  if (!email) return res.status(422).json({ message: "email is missing" });
  if (!password)
    return res.status(422).json({ message: "password is missing" });
  res.send("ok");
};
