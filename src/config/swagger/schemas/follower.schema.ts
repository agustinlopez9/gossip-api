export const followerSchemas = {
  Follower: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      follower_id: { type: "integer", example: 1 },
      followed_id: { type: "integer", example: 2 },
      created_at: { type: "string", format: "date-time" },
    },
  },
};
