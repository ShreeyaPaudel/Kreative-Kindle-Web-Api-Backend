import request from "supertest";
import app from "../app";

jest.setTimeout(30000);

// Helper — creates a unique user and returns { email, username, password, token }
const createUser = async (role?: string) => {
  const id = Date.now() + Math.floor(Math.random() * 9999);
  const user = {
    email:    `user_${id}@gmail.com`,
    username: `user_${id}`,
    password: "Password123",
    ...(role ? { role } : {}),
  };
  await request(app).post("/api/auth/register").send(user);
  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: user.email, password: user.password });
  return { ...user, token: login.body.token as string };
};

describe("Auth Integration Tests", () => {

  // ── REGISTER ──
  it("should register a new user successfully", async () => {
    const id  = Date.now();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: `reg_${id}@gmail.com`, username: `reg_${id}`, password: "Password123" });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User registered");
  });

  it("should return user object on register", async () => {
    const id  = Date.now();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: `obj_${id}@gmail.com`, username: `obj_${id}`, password: "Password123" });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBeDefined();
    expect(res.body.user.role).toBe("parent");
  });

  it("should not register duplicate email", async () => {
    const id   = Date.now();
    const body = { email: `dup_${id}@gmail.com`, username: `dup_${id}`, password: "Password123" };
    await request(app).post("/api/auth/register").send(body);
    const res = await request(app).post("/api/auth/register").send(body);
    expect(res.status).toBe(409);
  });

  it("should not register without email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ username: "noemail", password: "Password123" });
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
      .send({ email: "nouser@test.com", password: "Password123" });
    expect(res.status).toBe(400);
  });

  // ── LOGIN ──
  it("should login and return token", async () => {
    const user = await createUser();
    const res  = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("should return token as a string", async () => {
    const user = await createUser();
    const res  = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe("string");
  });

  it("should return user info on login", async () => {
    const user = await createUser();
    const res  = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(user.email);
  });

  it("should fail login with wrong password", async () => {
    const user = await createUser();
    const res  = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  it("should fail login with non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ghost_nobody_xyz@nowhere.com", password: "Password123" });
    expect(res.status).toBe(404);
  });

  it("should fail login with missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({});
    expect(res.status).toBe(400);
  });

  // ── FORGOT PASSWORD ──
  it("should handle forgot password for existing user", async () => {
    const user = await createUser();
    const res  = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: user.email });
    expect(res.status).toBe(200);
  });

  it("should handle forgot password for non-existent user gracefully", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "ghost@nowhere.com" });
    expect(res.status).toBe(200); // Returns 200 for security (generic message)
  });

  it("should require email field for forgot password", async () => {
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
      .set("Authorization", "Bearer thisisnotavalidtoken");
    expect(res.status).toBe(401);
  });

  it("should access protected route with valid token", async () => {
    const user = await createUser();
    const res  = await request(app)
      .get("/api/progress")
      .set("Authorization", `Bearer ${user.token}`);
    expect(res.status).toBe(200);
  });
});