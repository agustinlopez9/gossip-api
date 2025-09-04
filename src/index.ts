import express from "express";
import { routes } from "./config/index.ts";

const app = express();
const port = process.env.PORT || 5000;
routes(app);

app.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});
