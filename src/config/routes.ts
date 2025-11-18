import express from "express";
import users from "../controllers/users.ts"
import posts from "../controllers/posts.ts"

const routes = (app: express.Application) => {
  app.use(express.json())
  app.use("/api/users", users)
  app.use("/api/posts", posts)
}

export default routes;