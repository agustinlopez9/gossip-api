import { Router } from "express";
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
    await db
      .insertInto("posts")
      .values({
        title,
        content,
        author_id,
      })
      .execute();

    res.status(201).json({ message: "Post created successfully" });
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: `Error creating post: ${error.detail}` });
    } else {
      res.status(400).json({ error: `Error creating post` });
    }
  }
});

router.put("/:id", async (req, res) => {
  const postId = Number(req.params.id);
  const title = req.body.title;
  const content = req.body.content;

  if (!postId || isNaN(postId)) {
    return res.status(400).json({ error: "Missing or invalid Post ID" });
  }

  if (!title && !content) {
    return res.status(400).json({
      error: "At least one field (title or content) must be provided for update",
    });
  }

  const post = await db.selectFrom("posts").where("id", "=", postId).selectAll().executeTakeFirst();

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    const updateData = {
      title,
      content,
    };

    await db.updateTable("posts").set(updateData).where("id", "=", postId).execute();

    res.status(200).json({ message: "Post updated successfully" });
  } catch (error) {
    if (error instanceof DatabaseError) {
      res.status(400).json({ error: `Error updating post: ${error.detail}` });
    } else {
      res.status(400).json({ error: `Error updating post` });
    }
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await db.selectFrom("posts").selectAll().execute();
    res.json({ data: posts });
  } catch (error) {
    if (error instanceof DatabaseError) {
      return res.status(500).json({ error: `Error fetching posts: ${error.detail}` });
    }
    return res.status(500).json({ error: `Error fetching posts` });
  }
});

router.get("/:id", async (req, res) => {
  const postId = Number(req.params.id);

  if (!postId || isNaN(postId)) {
    return res.status(400).json({ error: "Missing or invalid Post ID" });
  }

  try {
    const post = await db.selectFrom("posts").where("id", "=", postId).selectAll().executeTakeFirst();
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ data: post });
  } catch (error) {
    if (error instanceof DatabaseError) {
      return res.status(500).json({ error: `Error fetching posts: ${error.detail}` });
    }
    return res.status(500).json({ error: `Error fetching post` });
  }
});

export default router;
