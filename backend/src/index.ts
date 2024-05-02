import express, { Request, RequestHandler, Response } from "express";

const app = express();

// app.use(bodyParser.json());
const bodyParser: RequestHandler = (req, res, next) => {
  req.on("data", (chunk) => {
    req.body = JSON.parse(chunk);
    next();
  });
};
app.use(express.json());

app.get("/get/:id", (req: Request, res: Response) => {
  const body = req.body.text;
  const id = req.params.id;

  res.send(body + id);
});

app.listen(8000, () => {
  console.log("the app is running on http://localhost:8000");
});
