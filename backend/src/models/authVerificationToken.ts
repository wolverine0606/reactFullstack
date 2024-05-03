import { compare, genSalt, hash } from "bcrypt";
import { Schema, model } from "mongoose";

interface VerifDocument extends Document {
  owner: Schema.Types.ObjectId;
  token: string;
  createdAt: Date;
}

interface Methods {
  compareToken(token: string): Promise<boolean>;
}

const authVerificationToken = new Schema<VerifDocument, {}, Methods>({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 86400,
    default: Date.now,
  },
});

authVerificationToken.pre("save", async function (next) {
  if (this.isModified("token")) {
    const salt = await genSalt(10);
    this.token = await hash(this.token, salt);
  }
  next();
});
authVerificationToken.methods.compareToken = async function (token) {
  return await compare(token, this.token);
};

const authVerificationTokenModel = model(
  "AuthVerificationToken",
  authVerificationToken
);

export default authVerificationTokenModel;
