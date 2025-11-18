import { Router } from "express"
import { DatabaseError } from "pg";
import { db } from "../database/database.ts";

const router = Router();

router.post("/", async (req, res) => {
  const title = req.body.title;
  const content = req.body.content;
  const author_id = req.body.author_id;

  if (!title || !content || !author_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await db.insertInto("posts").values({
      title,
      content,
      author_id
    }).execute();

    res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: `Error creating post: ${error.detail}` });
    } else {
      res.status(400).json({ error: `Error creating post` });
    }
  }
})

router.get("/", async (req, res) => {
  try {
    const posts = await db.selectFrom("posts").selectAll().execute();
    res.json({ data: posts});
  } catch (error) {
    return res.status(500).json({ error: `Error fetching posts` });
  }
})

router.get("/:id", async (req, res) => {
  const postId = Number(req.params.id);

  if(!postId || isNaN(postId)) {
    return res.status(400).json({ error: "Missing or invalid Post ID" });
  }

  try {
    const post = await db.selectFrom("posts").where("id", "=", postId).selectAll().executeTakeFirst();
    res.json({ data: post});
  } catch (error) {
    return res.status(500).json({ error: `Error fetching post` });
  }
})

export default router;