import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { db } from "database/database.ts";
import type { Users as User } from "types.ts";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await db
        .selectFrom("users")
        .selectAll()
        .where("username", "=", username)
        .executeTakeFirst();

      if (!user) {
        return done(null, false, { message: "Invalid username or password" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return done(null, false, { message: "Invalid username or password" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await db.selectFrom("users").selectAll().where("id", "=", id).executeTakeFirst();

    if (!user) {
      return done(null, false);
    }

    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
