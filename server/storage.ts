import { IStorage } from "./types";
import {
  User,
  Question,
  Answer,
  Comment,
  InsertUser,
  InsertQuestion,
  InsertAnswer,
  InsertComment,
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private questions: Map<number, Question>;
  private answers: Map<number, Answer>;
  private comments: Map<number, Comment>;
  sessionStore: session.Store;
  private currentIds: {
    users: number;
    questions: number;
    answers: number;
    comments: number;
  };

  constructor() {
    this.users = new Map();
    this.questions = new Map();
    this.answers = new Map();
    this.comments = new Map();
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    this.currentIds = {
      users: 1,
      questions: 1,
      answers: 1,
      comments: 1,
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createQuestion(
    insertQuestion: InsertQuestion,
    authorId: number,
  ): Promise<Question> {
    const id = this.currentIds.questions++;
    const question: Question = {
      ...insertQuestion,
      id,
      authorId,
      votes: 0,
      createdAt: new Date(),
    };
    this.questions.set(id, question);
    return question;
  }

  async getAnswers(questionId: number): Promise<Answer[]> {
    return Array.from(this.answers.values()).filter(
      (answer) => answer.questionId === questionId,
    );
  }

  async createAnswer(
    insertAnswer: InsertAnswer,
    questionId: number,
    authorId: number,
  ): Promise<Answer> {
    const id = this.currentIds.answers++;
    const answer: Answer = {
      ...insertAnswer,
      id,
      questionId,
      authorId,
      votes: 0,
      createdAt: new Date(),
    };
    this.answers.set(id, answer);
    return answer;
  }

  async getComments(questionId?: number, answerId?: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) =>
        (questionId && comment.questionId === questionId) ||
        (answerId && comment.answerId === answerId),
    );
  }

  async createComment(
    insertComment: InsertComment,
    authorId: number,
    questionId?: number,
    answerId?: number,
  ): Promise<Comment> {
    const id = this.currentIds.comments++;
    const comment: Comment = {
      ...insertComment,
      id,
      authorId,
      questionId: questionId || null,
      answerId: answerId || null,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async voteQuestion(id: number, value: number): Promise<Question> {
    const question = this.questions.get(id);
    if (!question) throw new Error("Question not found");
    question.votes += value;
    this.questions.set(id, question);
    return question;
  }

  async voteAnswer(id: number, value: number): Promise<Answer> {
    const answer = this.answers.get(id);
    if (!answer) throw new Error("Answer not found");
    answer.votes += value;
    this.answers.set(id, answer);
    return answer;
  }
}

export const storage = new MemStorage();
