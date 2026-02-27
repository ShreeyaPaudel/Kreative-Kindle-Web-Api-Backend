import request from "supertest";
import app from "../app";

jest.setTimeout(30000);

describe("Auth Integration Tests", () => {
  let token: string;

  const testUser = {
    email: "testuser_auth@gmail.com",
    username: "testuser_auth",
    password: "Password123",
  };

  // ── REGISTER ──
  it("should register a user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);
    expect([200, 201]).toContain(res.status);
  });

  it("should not register without email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "nomail", password: "Password123" });
    expect(res.status).toBe(400);
  });

  it("should not register without password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "nopass@test.com", username: "nopass" });
    expect(res.status).toBe(400);
  });

  it("should not register without username", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "nousername@test.com", password: "Password123" });
    expect(res.status).toBe(400);
  });

  // ── LOGIN ──
  it("should login user and return token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    expect([200, 201]).toContain(res.status);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it("should fail login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: "wrongpassword" });
    expect([400, 401]).toContain(res.status);
  });

  it("should fail login with non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@nowhere.com", password: "Password123" });
    expect([400, 401, 404]).toContain(res.status);
  });

  it("should fail login with missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});
    expect([400, 401]).toContain(res.status);
  });

  it("should return token as string on login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    expect([200, 201]).toContain(res.status);
    expect(typeof res.body.token).toBe("string");
  });

  // ── FORGOT PASSWORD ──
  it("should request forgot password", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: testUser.email });
    expect([200, 201]).toContain(res.status);
  });

  it("should require email for forgot password", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({});
    expect(res.status).toBe(400);
  });

  // ── PROTECTED ROUTES ──
  it("should reject protected route without token", async () => {
    const res = await request(app).get("/api/admin/users");
    expect(res.status).toBe(401);
  });

  it("should reject protected route with invalid token", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", "Bearer invalidtoken123");
    expect(res.status).toBe(401);
  });
});