export const likeSchemas = {
  Like: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      user_id: { type: "integer", example: 1 },
      post_id: { type: "integer", example: 1 },
      created_at: { type: "string", format: "date-time" },
    },
  },
};
