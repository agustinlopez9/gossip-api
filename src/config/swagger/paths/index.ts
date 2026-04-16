import { authPaths } from "./auth.paths.ts";
import { postsPaths } from "./posts.paths.ts";
import { usersPaths } from "./users.paths.ts";
import { followersPaths } from "./followers.paths.ts";
import { likesPaths } from "./likes.paths.ts";

export const paths = {
  ...authPaths,
  ...postsPaths,
  ...usersPaths,
  ...followersPaths,
  ...likesPaths,
};
