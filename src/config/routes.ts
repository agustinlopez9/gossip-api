import express from "express";
import users from "../controllers/users.ts"

const routes = (app: express.Application) => {
  app.use(express.json())
  app.use("/api/users", users)
}

export default routes;