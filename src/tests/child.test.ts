import request from "supertest";
import app from "../app";

jest.setTimeout(30000);

describe("Child Profile Integration Tests", () => {
  let parentToken: string;
  let parentToken2: string;
  let createdChildId: string;

  beforeAll(async () => {
    // Create first parent
    const id1   = Date.now();
    const user1 = { email: `child_parent_${id1}@gmail.com`, username: `child_parent_${id1}`, password: "Password123" };
    await request(app).post("/api/auth/register").send(user1);
    const login1 = await request(app).post("/api/auth/login").send({ email: user1.email, password: user1.password });
    parentToken = login1.body.token;

    // Create second parent (to test ownership)
    const id2   = Date.now() + 1;
    const user2 = { email: `child_parent_${id2}@gmail.com`, username: `child_parent_${id2}`, password: "Password123" };
    await request(app).post("/api/auth/register").send(user2);
    const login2 = await request(app).post("/api/auth/login").send({ email: user2.email, password: user2.password });
    parentToken2 = login2.body.token;
  });

  // ── CREATE ──
  it("should create a child profile", async () => {
    const res = await request(app)
      .post("/api/children")
      .set("Authorization", `Bearer ${parentToken}`)
      .send({ name: "Emma", age: 5 });
    expect(res.status).toBe(201);
    expect(res.body.data._id).toBeDefined();
    expect(res.body.data.name).toBe("Emma");
    createdChildId = res.body.data._id;
  });

  it("should not create child without name", async () => {
    const res = await request(app)
      .post("/api/children")
      .set("Authorization", `Bearer ${parentToken}`)
      .send({ age: 5 });
    expect(res.status).toBe(400);
  });

  it("should not create child without age", async () => {
    const res = await request(app)
      .post("/api/children")
      .set("Authorization", `Bearer ${parentToken}`)
      .send({ name: "Emma" });
    expect(res.status).toBe(400);
  });

  it("should not create child without token", async () => {
    const res = await request(app)
      .post("/api/children")
      .send({ name: "Emma", age: 5 });
    expect(res.status).toBe(401);
  });

  it("should not create child with age above 12", async () => {
    const res = await request(app)
      .post("/api/children")
      .set("Authorization", `Bearer ${parentToken}`)
      .send({ name: "Emma", age: 15 });
    expect(res.status).toBe(400);
  });

  // ── GET ALL ──
  it("should get all children for parent", async () => {
    const res = await request(app)
      .get("/api/children")
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should not get children without token", async () => {
    const res = await request(app).get("/api/children");
    expect(res.status).toBe(401);
  });

  it("should only return own children", async () => {
    const res = await request(app)
      .get("/api/children")
      .set("Authorization", `Bearer ${parentToken2}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(0);
  });

  // ── GET BY ID ──
  it("should get child by ID", async () => {
    const res = await request(app)
      .get(`/api/children/${createdChildId}`)
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Emma");
  });

  it("should return 404 for non-existent child", async () => {
    const res = await request(app)
      .get("/api/children/000000000000000000000000")
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(404);
  });

  it("should not get another parent's child", async () => {
    const res = await request(app)
      .get(`/api/children/${createdChildId}`)
      .set("Authorization", `Bearer ${parentToken2}`);
    expect(res.status).toBe(404);
  });

  // ── UPDATE ──
  it("should update child profile", async () => {
    const res = await request(app)
      .put(`/api/children/${createdChildId}`)
      .set("Authorization", `Bearer ${parentToken}`)
      .send({ name: "Emma Rose", age: 6 });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Emma Rose");
  });

  it("should not update another parent's child", async () => {
    const res = await request(app)
      .put(`/api/children/${createdChildId}`)
      .set("Authorization", `Bearer ${parentToken2}`)
      .send({ name: "Hacked" });
    expect(res.status).toBe(404);
  });

  it("should not update without token", async () => {
    const res = await request(app)
      .put(`/api/children/${createdChildId}`)
      .send({ name: "No auth" });
    expect(res.status).toBe(401);
  });

  // ── DELETE ──
  it("should not delete another parent's child", async () => {
    const res = await request(app)
      .delete(`/api/children/${createdChildId}`)
      .set("Authorization", `Bearer ${parentToken2}`);
    expect(res.status).toBe(404);
  });

  it("should not delete without token", async () => {
    const res = await request(app)
      .delete(`/api/children/${createdChildId}`);
    expect(res.status).toBe(401);
  });

  it("should delete child profile", async () => {
    const res = await request(app)
      .delete(`/api/children/${createdChildId}`)
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Child profile deleted");
  });

  it("should return 404 after deletion", async () => {
    const res = await request(app)
      .get(`/api/children/${createdChildId}`)
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(404);
  });
});