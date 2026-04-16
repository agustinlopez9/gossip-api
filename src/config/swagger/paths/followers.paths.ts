export const followersPaths = {
  "/api/followers": {
    get: {
      summary: "Get all follower relationships",
      tags: ["Followers"],
      responses: {
        200: {
          description: "List of all follower relationships",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "array", items: { $ref: "#/components/schemas/Follower" } },
                },
              },
            },
          },
        },
      },
    },
    post: {
      summary: "Follow a user",
      tags: ["Followers"],
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["followed_id"],
              properties: { followed_id: { type: "integer", example: 2 } },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Follow relationship created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Follow relationship created successfully",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Cannot follow yourself",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        409: {
          description: "Already following this user",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
  },
  "/api/followers/{id}": {
    get: {
      summary: "Get a follower relationship by ID",
      tags: ["Followers"],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
      responses: {
        200: {
          description: "Follower relationship details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { data: { $ref: "#/components/schemas/Follower" } },
              },
            },
          },
        },
        404: {
          description: "Follow relationship not found",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
    delete: {
      summary: "Unfollow a user",
      tags: ["Followers"],
      security: [{ cookieAuth: [] }],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
      responses: {
        200: {
          description: "Unfollow successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: {
                    type: "string",
                    example: "Follow relationship deleted successfully",
                  },
                },
              },
            },
          },
        },
        403: {
          description: "Not authorized",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        404: {
          description: "Follow relationship not found",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
  },
  "/api/followers/check/{userId}": {
    get: {
      summary: "Check if currently authenticated user follows another user",
      tags: ["Followers"],
      security: [{ cookieAuth: [] }],
      parameters: [{ in: "path", name: "userId", required: true, schema: { type: "integer" } }],
      responses: {
        200: {
          description: "Follow status",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "object",
                    properties: {
                      is_following: { type: "boolean", example: true },
                      follow_id: { type: "integer", nullable: true, example: 42 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
