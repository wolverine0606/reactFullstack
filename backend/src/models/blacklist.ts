import { Schema, model } from "mongoose";

interface VerifDocument extends Document {
  email: string;
}

const blacklist = new Schema<VerifDocument, {}>({
  email: { type: String, unique: true, required: true },
});

const blacklistModel = model("blacklist", blacklist);

export default blacklistModel;
