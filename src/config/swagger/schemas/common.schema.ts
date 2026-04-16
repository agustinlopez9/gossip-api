export const commonSchemas = {
  Error: {
    type: "object",
    properties: {
      error: { type: "string", example: "Error message" },
      statusCode: { type: "integer", example: 400 },
    },
  },
};
