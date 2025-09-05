import express from "express";
import { routes } from "./config/index.ts";

const app = express();
const port = Number(process.env.API_PORT) || 4000;
routes(app);

app.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});
