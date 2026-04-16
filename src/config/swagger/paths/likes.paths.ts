export const likesPaths = {
  "/api/likes": {
    get: {
      summary: "Get all likes",
      tags: ["Likes"],
      responses: {
        200: {
          description: "List of all likes",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "array", items: { $ref: "#/components/schemas/Like" } },
                },
              },
            },
          },
        },
      },
    },
    post: {
      summary: "Like a post",
      tags: ["Likes"],
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["post_id"],
              properties: { post_id: { type: "integer", example: 1 } },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Like created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { message: { type: "string", example: "Like created successfully" } },
              },
            },
          },
        },
        409: {
          description: "Already liked this post",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
  },
  "/api/likes/{id}": {
    get: {
      summary: "Get a like by ID",
      tags: ["Likes"],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
      responses: {
        200: {
          description: "Like details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { data: { $ref: "#/components/schemas/Like" } },
              },
            },
          },
        },
        404: {
          description: "Like not found",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
    delete: {
      summary: "Unlike a post",
      tags: ["Likes"],
      security: [{ cookieAuth: [] }],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
      responses: {
        200: {
          description: "Unlike successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { message: { type: "string", example: "Like deleted successfully" } },
              },
            },
          },
        },
        403: {
          description: "Not authorized",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        404: {
          description: "Like not found",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
  },
};
