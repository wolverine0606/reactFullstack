import express, { Request, Response, urlencoded } from "express";
import authRouter from "./routes/auth";

const app = express();

app.use(express.json());
app.use(urlencoded({ extended: false }));
//Api routes
app.use("/auth", authRouter);

app.get("/get/:id", (req: Request, res: Response) => {
  const body = req.body.text;
  const id = req.params.id;

  res.send(body + id);
});

app.listen(8000, () => {
  console.log("the app is running on http://localhost:8000");
});
