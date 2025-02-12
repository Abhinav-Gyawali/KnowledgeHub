import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import {
  insertQuestionSchema,
  insertAnswerSchema,
  insertCommentSchema,
} from "@shared/schema";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  app.get("/api/questions", async (_req, res) => {
    const questions = await storage.getQuestions();
    res.json(questions);
  });

  app.get("/api/questions/:id", async (req, res) => {
    const question = await storage.getQuestion(parseInt(req.params.id));
    if (!question) return res.sendStatus(404);
    res.json(question);
  });

  app.post("/api/questions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertQuestionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).send(parsed.error);
    const question = await storage.createQuestion(parsed.data, req.user.id);
    res.status(201).json(question);
  });

  app.get("/api/questions/:id/answers", async (req, res) => {
    const answers = await storage.getAnswers(parseInt(req.params.id));
    res.json(answers);
  });

  app.post("/api/questions/:id/answers", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertAnswerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).send(parsed.error);
    const answer = await storage.createAnswer(
      parsed.data,
      parseInt(req.params.id),
      req.user.id,
    );
    res.status(201).json(answer);
  });

  app.get("/api/questions/:id/comments", async (req, res) => {
    const comments = await storage.getComments(parseInt(req.params.id));
    res.json(comments);
  });

  app.get("/api/answers/:id/comments", async (req, res) => {
    const comments = await storage.getComments(undefined, parseInt(req.params.id));
    res.json(comments);
  });

  app.post("/api/questions/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertCommentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).send(parsed.error);
    const comment = await storage.createComment(
      parsed.data,
      req.user.id,
      parseInt(req.params.id),
    );
    res.status(201).json(comment);
  });

  app.post("/api/answers/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const parsed = insertCommentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).send(parsed.error);
    const comment = await storage.createComment(
      parsed.data,
      req.user.id,
      undefined,
      parseInt(req.params.id),
    );
    res.status(201).json(comment);
  });

  app.post("/api/questions/:id/vote", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const value = req.body.value === "up" ? 1 : -1;
    const question = await storage.voteQuestion(parseInt(req.params.id), value);
    res.json(question);
  });

  app.post("/api/answers/:id/vote", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const value = req.body.value === "up" ? 1 : -1;
    const answer = await storage.voteAnswer(parseInt(req.params.id), value);
    res.json(answer);
  });

  const httpServer = createServer(app);
  return httpServer;
}
