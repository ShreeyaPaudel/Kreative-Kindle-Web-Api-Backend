import request from "supertest";
import app from "../app";

jest.setTimeout(30000);

describe("Auth Integration Tests", () => {
  let token: string;

  const testUser = {
    email: "testuser@gmail.com",
    username: "testuser",
    password: "Password123",
  };

  it("should register a user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);
    expect(res.status).toBe(201);
  });

  it("should not register duplicate email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);
    expect(res.status).toBe(409);
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

  it("should login user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it("should fail login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  it("should fail login with non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@nowhere.com", password: "Password123" });
    expect(res.status).toBe(401);
  });

  it("should fail login with missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});
    expect(res.status).toBe(400);
  });

  it("should request forgot password", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: testUser.email });
    expect(res.status).toBe(200);
  });

  it("should require email for forgot password", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({});
    expect(res.status).toBe(400);
  });

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

  it("should return token as string on login", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    expect(typeof res.body.token).toBe("string");
  });
});