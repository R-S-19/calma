import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;
let app;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET = "test-secret-for-vitest";

  await mongoose.connect(mongoServer.getUri());

  app = require("../app");
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections, then register a fresh user for each test
  // so tests don't leak state or tasks between each other.
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }

  const res = await request(app)
    .post("/api/auth/register")
    .send({ email: "tasktester@example.com", password: "password123" });

  token = res.body.token;
});

function authed(req) {
  return req.set("Authorization", `Bearer ${token}`);
}

describe("GET /api/tasks", () => {
  it("returns an empty list for a new user", async () => {
    const res = await authed(request(app).get("/api/tasks"));

    expect(res.status).toBe(200);
    expect(res.body.tasks).toEqual([]);
  });

  it("rejects requests without a token", async () => {
    const res = await request(app).get("/api/tasks");

    expect(res.status).toBe(401);
  });
});

describe("POST /api/tasks", () => {
  it("creates a task with default priority when none given", async () => {
    const res = await authed(request(app).post("/api/tasks")).send({
      title: "Write tests",
    });

    expect(res.status).toBe(201);
    expect(res.body.task.title).toBe("Write tests");
    expect(res.body.task.priority).toBe("normal");
    expect(res.body.task.completed).toBe(false);
  });

  it("rejects a task with no title", async () => {
    const res = await authed(request(app).post("/api/tasks")).send({
      priority: "high",
    });

    expect(res.status).toBe(400);
  });

  it("rejects an invalid priority by falling back to normal", async () => {
    const res = await authed(request(app).post("/api/tasks")).send({
      title: "Weird priority",
      priority: "urgent-ish",
    });

    expect(res.status).toBe(201);
    expect(res.body.task.priority).toBe("normal");
  });
});

describe("PATCH /api/tasks/:id", () => {
  it("toggles a task's completed status", async () => {
    const created = await authed(request(app).post("/api/tasks")).send({
      title: "Toggle me",
    });
    const taskId = created.body.task._id;

    const res = await authed(request(app).patch(`/api/tasks/${taskId}`)).send({});

    expect(res.status).toBe(200);
    expect(res.body.task.completed).toBe(true);
    expect(res.body.task.completedAt).not.toBeNull();
  });

  it("updates priority without toggling completed", async () => {
    const created = await authed(request(app).post("/api/tasks")).send({
      title: "Change priority",
    });
    const taskId = created.body.task._id;

    const res = await authed(request(app).patch(`/api/tasks/${taskId}`)).send({
      priority: "high",
    });

    expect(res.status).toBe(200);
    expect(res.body.task.priority).toBe("high");
    expect(res.body.task.completed).toBe(false);
  });

  it("returns 404 for a task that doesn't exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await authed(request(app).patch(`/api/tasks/${fakeId}`)).send({});

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("deletes a task", async () => {
    const created = await authed(request(app).post("/api/tasks")).send({
      title: "Delete me",
    });
    const taskId = created.body.task._id;

    const res = await authed(request(app).delete(`/api/tasks/${taskId}`));
    expect(res.status).toBe(204);

    const list = await authed(request(app).get("/api/tasks"));
    expect(list.body.tasks).toHaveLength(0);
  });

  it("returns 404 when deleting a task that doesn't belong to the user", async () => {
    // Create a task as user A
    const created = await authed(request(app).post("/api/tasks")).send({
      title: "Not yours",
    });
    const taskId = created.body.task._id;

    // Register a second user and try to delete user A's task
    const otherUser = await request(app)
      .post("/api/auth/register")
      .send({ email: "other@example.com", password: "password123" });
    const otherToken = otherUser.body.token;

    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/tasks/completed", () => {
  it("clears only completed tasks", async () => {
    const t1 = await authed(request(app).post("/api/tasks")).send({ title: "Keep me" });
    const t2 = await authed(request(app).post("/api/tasks")).send({ title: "Remove me" });

    await authed(request(app).patch(`/api/tasks/${t2.body.task._id}`)).send({});

    const res = await authed(request(app).delete("/api/tasks/completed"));
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(1);

    const list = await authed(request(app).get("/api/tasks"));
    expect(list.body.tasks).toHaveLength(1);
    expect(list.body.tasks[0].title).toBe("Keep me");
  });
});