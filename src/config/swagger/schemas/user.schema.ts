export const userSchemas = {
  User: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      username: { type: "string", example: "alice" },
      email: { type: "string", format: "email", example: "alice@example.com" },
      first_name: { type: "string", example: "Alice" },
      last_name: { type: "string", example: "Johnson" },
      created_at: { type: "string", format: "date-time" },
    },
  },
  UserProfile: {
    allOf: [
      { $ref: "#/components/schemas/User" },
      {
        type: "object",
        properties: {
          followers_count: { type: "integer", example: 42 },
          following_count: { type: "integer", example: 128 },
          posts_count: { type: "integer", example: 56 },
        },
      },
    ],
  },
};
