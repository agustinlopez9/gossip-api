export const authPaths = {
  "/api/auth/signup": {
    post: {
      summary: "Register a new user",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "email", "first_name", "password"],
              properties: {
                username: { type: "string", minLength: 3, maxLength: 30, example: "alice" },
                email: { type: "string", format: "email", example: "alice@example.com" },
                first_name: { type: "string", minLength: 1, maxLength: 50, example: "Alice" },
                last_name: { type: "string", maxLength: 50, example: "Johnson" },
                password: {
                  type: "string",
                  minLength: 8,
                  maxLength: 100,
                  example: "Password123!",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "User created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "User created successfully" },
                  user: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
        409: {
          description: "Username or email already exists",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
  },
  "/api/auth/login": {
    post: {
      summary: "Login with username and password",
      tags: ["Auth"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["username", "password"],
              properties: {
                username: { type: "string", example: "alice" },
                password: { type: "string", example: "Password123!" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Login successful" },
                  user: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
        401: {
          description: "Invalid credentials",
          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
        },
      },
    },
  },
  "/api/auth/logout": {
    post: {
      summary: "Logout the current user",
      tags: ["Auth"],
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Logout successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { message: { type: "string", example: "Logout successful" } },
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
  "/api/auth/me": {
    get: {
      summary: "Get current authenticated user",
      tags: ["Auth"],
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Current user information",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { user: { $ref: "#/components/schemas/User" } },
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
};
