import { userSchemas } from "./user.schema.ts";
import { postSchemas } from "./post.schema.ts";
import { followerSchemas } from "./follower.schema.ts";
import { likeSchemas } from "./like.schema.ts";
import { commonSchemas } from "./common.schema.ts";

export const schemas = {
  ...userSchemas,
  ...postSchemas,
  ...followerSchemas,
  ...likeSchemas,
  ...commonSchemas,
};
