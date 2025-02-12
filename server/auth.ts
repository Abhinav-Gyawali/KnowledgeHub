import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { generateVerificationToken, sendVerificationEmail } from "./email";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        const user = await storage.getUserByEmail(email);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid email or password" });
        }
        if (!user.isEmailVerified) {
          return done(null, false, { message: "Please verify your email first" });
        }
        return done(null, user);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  app.post("/api/register", async (req, res, next) => {
    // Verify CAPTCHA token
    if (!req.body.captchaToken) {
      return res.status(400).send("CAPTCHA verification required");
    }

    const existingUser = await storage.getUserByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).send("Email already registered");
    }

    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24); // Token expires in 24 hours

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
      verificationToken,
      verificationTokenExpiry: tokenExpiry,
    });

    try {
      await sendVerificationEmail(user.email, verificationToken);
      res.status(201).json({ message: "Please check your email to verify your account" });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Delete the user if we couldn't send the verification email
      await storage.deleteUser(user.id);
      res.status(500).send("Failed to send verification email");
    }
  });

  app.get("/api/verify-email", async (req, res) => {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send("Verification token is required");
    }

    const user = await storage.getUserByVerificationToken(token as string);
    if (!user) {
      return res.status(400).send("Invalid verification token");
    }

    if (user.verificationTokenExpiry && new Date() > new Date(user.verificationTokenExpiry)) {
      return res.status(400).send("Verification token has expired");
    }

    await storage.verifyUserEmail(user.id);
    res.redirect("/auth?verified=true");
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Add route to resend verification email
  app.post("/api/resend-verification", async (req, res) => {
    const { email } = req.body;
    const user = await storage.getUserByEmail(email);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.isEmailVerified) {
      return res.status(400).send("Email is already verified");
    }

    const verificationToken = generateVerificationToken();
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);

    await storage.updateVerificationToken(user.id, verificationToken, tokenExpiry);

    try {
      await sendVerificationEmail(user.email, verificationToken);
      res.status(200).json({ message: "Verification email sent" });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      res.status(500).send("Failed to send verification email");
    }
  });
}