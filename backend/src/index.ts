import "express-async-errors";
import "./db/index";
import express, {
  Request,
  Response,
  urlencoded,
  ErrorRequestHandler,
} from "express";
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

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(500).json({ message: err.message });
};
app.use(errorHandler);

app.listen(8000, () => {
  console.log("the app is running on http://localhost:8000");
});
