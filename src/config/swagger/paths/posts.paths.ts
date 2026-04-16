export const postsPaths = {
  "/api/posts": {
    get: {
      summary: "Get all posts with pagination",
      tags: ["Posts"],
      parameters: [
        {
          in: "query",
          name: "author_id",
          schema: { type: "integer" },
          description: "Filter posts by author ID",
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          description: "Number of posts per page",
        },
        {
          in: "query",
          name: "offset",
          schema: { type: "integer", minimum: 0, default: 0 },
          description: "Number of posts to skip",
        },
      ],
      responses: {
        200: {
          description: "List of posts",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "array", items: { $ref: "#/components/schemas/Post" } },
                  pagination: {
                    type: "object",
                    properties: {
                      limit: { type: "integer" },
                      offset: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    post: {
      summary: "Create a new post",
      tags: ["Posts"],
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["title", "content"],
              properties: {
                title: { type: "string", minLength: 1, maxLength: 255, example: "Hello World" },
                content: { type: "string", minLength: 1, example: "This is my first post!" },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Post created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { message: { type: "string", example: "Post created successfully" } },
              },
            },
          },
        },
        401: {
          description: "Not authenticated",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
  },
  "/api/posts/feed": {
    get: {
      summary: "Get personalized feed (posts from followed users)",
      tags: ["Posts"],
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
        },
        {
          in: "query",
          name: "offset",
          schema: { type: "integer", minimum: 0, default: 0 },
        },
      ],
      responses: {
        200: {
          description: "Personalized feed",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "array", items: { $ref: "#/components/schemas/Post" } },
                  pagination: {
                    type: "object",
                    properties: {
                      limit: { type: "integer" },
                      offset: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Not authenticated",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
  },
  "/api/posts/{id}": {
    get: {
      summary: "Get a post by ID",
      tags: ["Posts"],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
      responses: {
        200: {
          description: "Post details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { data: { $ref: "#/components/schemas/Post" } },
              },
            },
          },
        },
        404: {
          description: "Post not found",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
    put: {
      summary: "Update a post",
      tags: ["Posts"],
      security: [{ cookieAuth: [] }],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["title", "content"],
              properties: {
                title: { type: "string", minLength: 1, maxLength: 255 },
                content: { type: "string", minLength: 1 },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Post updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { message: { type: "string" } },
              },
            },
          },
        },
        403: {
          description: "Not authorized to update this post",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        404: {
          description: "Post not found",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
    delete: {
      summary: "Delete a post",
      tags: ["Posts"],
      security: [{ cookieAuth: [] }],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
      responses: {
        200: {
          description: "Post deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { message: { type: "string" } },
              },
            },
          },
        },
        403: {
          description: "Not authorized to delete this post",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
        404: {
          description: "Post not found",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
  },
  "/api/posts/{id}/likes": {
    get: {
      summary: "Get users who liked a post",
      tags: ["Posts"],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
      responses: {
        200: {
          description: "List of users who liked the post",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "integer" },
                        username: { type: "string" },
                        first_name: { type: "string" },
                        last_name: { type: "string" },
                        liked_at: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        404: {
          description: "Post not found",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
  },
};
