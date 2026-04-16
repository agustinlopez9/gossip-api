export const usersPaths = {
  "/api/users/{id}": {
    get: {
      summary: "Get user profile with statistics",
      tags: ["Users"],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
      responses: {
        200: {
          description: "User profile",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { data: { $ref: "#/components/schemas/UserProfile" } },
              },
            },
          },
        },
        404: {
          description: "User not found",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
    put: {
      summary: "Update user profile (own profile only)",
      tags: ["Users"],
      security: [{ cookieAuth: [] }],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                first_name: { type: "string", minLength: 1, maxLength: 50 },
                last_name: { type: "string", maxLength: 50 },
                email: { type: "string", format: "email" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Profile updated successfully",
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
          description: "Can only update own profile",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
  },
  "/api/users/{id}/posts": {
    get: {
      summary: "Get all posts by a user",
      tags: ["Users"],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
      responses: {
        200: {
          description: "List of user's posts",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: { type: "array", items: { $ref: "#/components/schemas/Post" } },
                },
              },
            },
          },
        },
      },
    },
  },
  "/api/users/{id}/followers": {
    get: {
      summary: "Get user's followers",
      tags: ["Users"],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
      responses: {
        200: {
          description: "List of followers",
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
                        followed_at: { type: "string", format: "date-time" },
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
  },
  "/api/users/{id}/following": {
    get: {
      summary: "Get users that this user is following",
      tags: ["Users"],
      parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
      responses: {
        200: {
          description: "List of users being followed",
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
                        followed_at: { type: "string", format: "date-time" },
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
  },
};
