export const baseConfig = {
  openapi: "3.0.0",
  info: {
    title: "Gossip API",
    version: "1.0.0",
    description: "API for a Twitter-like social media platform",
    contact: {
      name: "API Support",
    },
  },
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey" as const,
        in: "cookie" as const,
        name: "connect.sid",
        description: "Session cookie for authentication",
      },
    },
  },
};
