import { Router } from "express";
import { DatabaseError } from "pg";
import { db } from "../database/database.ts";

const router = Router();

router.post("/", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;

  if (!username || !email || !first_name || !last_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await db
      .insertInto("users")
      .values({
        username,
        email,
        first_name,
        last_name,
      })
      .execute();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: `Error creating user: ${error.detail}` });
    } else {
      res.status(400).json({ error: `Error creating user` });
    }
  }
});

router.get("/me", async (req, res) => {
  const user = await db.selectFrom("users").selectAll().executeTakeFirst();
  res.send({ data: user });
});

export default router;
