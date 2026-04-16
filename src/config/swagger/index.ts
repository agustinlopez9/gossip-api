import swaggerJsdoc from "swagger-jsdoc";
import { baseConfig } from "./base.ts";
import { tags } from "./tags.ts";
import { schemas } from "./schemas/index.ts";
import { paths } from "./paths/index.ts";

const options: swaggerJsdoc.Options = {
  definition: {
    ...baseConfig,
    tags,
    components: {
      ...baseConfig.components,
      schemas,
    },
    paths,
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
