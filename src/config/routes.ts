import express from "express";
import auth from "controllers/auth.ts";
import posts from "controllers/posts.ts";
import followers from "controllers/followers.ts";
import likes from "controllers/likes.ts";

const routes = (app: express.Application) => {
  app.use(express.json());
  app.use("/api/auth", auth);
  app.use("/api/posts", posts);
  app.use("/api/followers", followers);
  app.use("/api/likes", likes);
};

export default routes;
