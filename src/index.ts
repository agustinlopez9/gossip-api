import express from "express";
import { routes } from "config/index.ts";
import { errorHandler } from "middleware/errorHandler.ts";

const app = express();

app.use(express.json());

routes(app);

// Error handler must be registered AFTER all routes
app.use(errorHandler);

const port = Number(process.env.API_PORT) || 4000;

app.listen(port, () => {
  console.log(`Server up and running on port ${port}`);
});
