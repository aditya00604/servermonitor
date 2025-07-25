import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Express } from "express";
import { storage } from "./storage";
import 'dotenv/config';
export function setupOAuth(app: Express) {
  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "dummy",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error("No email found in Google profile"), null);
      }

      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({
          email,
          password: "", // OAuth users don't need passwords
          firstName: profile.name?.givenName || profile.displayName || email.split('@')[0],
          lastName: profile.name?.familyName || "",
          googleId: profile.id,
          emailVerified: true,
        });
      } else if (!user.googleId) {
        // Link existing user with Google account
        user = await storage.updateUser(user.id, {
          googleId: profile.id,
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // GitHub OAuth Strategy
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || "dummy",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "dummy",
    callbackURL: "/api/auth/github/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error("No email found in GitHub profile"), null);
      }

      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({
          email,
          password: "", // OAuth users don't need passwords
          firstName: profile.displayName || profile.username || email.split('@')[0],
          lastName: "",
          githubId: profile.id,
          emailVerified: true,
        });
      } else if (!user.githubId) {
        // Link existing user with GitHub account
        user = await storage.updateUser(user.id, {
          githubId: profile.id,
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  // OAuth Routes
  app.get("/api/auth/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth" }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );

  app.get("/api/auth/github",
    passport.authenticate("github", { scope: ["user:email"] })
  );

  app.get("/api/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/auth" }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );
}
