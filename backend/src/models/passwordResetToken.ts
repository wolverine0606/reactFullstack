import { compare, genSalt, hash } from "bcrypt";
import { Schema, model } from "mongoose";

interface passResetTokenDocument extends Document {
  owner: Schema.Types.ObjectId;
  token: string;
  createdAt: Date;
}

interface Methods {
  compareToken(token: string): Promise<boolean>;
}

const schema = new Schema<passResetTokenDocument, {}, Methods>({
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
    expires: 3600,
    default: Date.now,
  },
});

schema.pre("save", async function (next) {
  if (this.isModified("token")) {
    const salt = await genSalt(10);
    this.token = await hash(this.token, salt);
  }
  next();
});
schema.methods.compareToken = async function (token) {
  return await compare(token, this.token);
};

const PasswordResetTokenModel = model("PasswordResetToken", schema);

export default PasswordResetTokenModel;
