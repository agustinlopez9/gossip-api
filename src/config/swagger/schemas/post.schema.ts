export const postSchemas = {
  Post: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      title: { type: "string", example: "Hello World" },
      content: { type: "string", example: "This is my first post!" },
      author_id: { type: "integer", example: 1 },
      created_at: { type: "string", format: "date-time" },
      likes_count: { type: "integer", example: 5 },
      has_liked: { type: "boolean", example: false },
    },
  },
};
