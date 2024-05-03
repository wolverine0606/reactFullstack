import { connect } from "mongoose";

const uri = "mongodb://0.0.0.0:27017/smart-cycle-market";
connect(uri)
  .then(() => console.log("db connected successfully"))
  .catch((err) => {
    console.log(err);
  });
