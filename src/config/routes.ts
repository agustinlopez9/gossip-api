import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/index.ts";
import auth from "controllers/auth.ts";
import posts from "controllers/posts.ts";
import followers from "controllers/followers.ts";
import likes from "controllers/likes.ts";
import users from "controllers/users.ts";

const routes = (app: express.Application) => {
  app.use(express.json());

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/api/auth", auth);
  app.use("/api/posts", posts);
  app.use("/api/followers", followers);
  app.use("/api/likes", likes);
  app.use("/api/users", users);
};

export default routes;
