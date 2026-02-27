import request from "supertest";
import app from "../app";

jest.setTimeout(30000);

const createUser = async () => {
  const id   = Date.now() + Math.floor(Math.random() * 9999);
  const user = { email: `user_${id}@gmail.com`, username: `user_${id}`, password: "Password123" };
  await request(app).post("/api/auth/register").send(user);
  const login = await request(app).post("/api/auth/login").send({ email: user.email, password: user.password });
  return { ...user, token: login.body.token as string };
};

describe("Admin Users Integration", () => {
  let adminToken:   string;
  let adminId:      string;
  let parentToken:  string;

  beforeAll(async () => {
    // Parent user
    const parent = await createUser();
    parentToken  = parent.token;

    // Admin login
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@email.com", password: "Admin123!" });
    adminToken = adminLogin.body.token;
    adminId    = adminLogin.body.user?.id;
  });

  // ── GET ALL USERS ──
  it("should get paginated users as admin", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.users).toBeDefined();
    expect(res.body.meta).toBeDefined();
  });

  it("should return users as an array", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
  });

  it("should return meta with totalPages", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBeDefined();
  });

  it("should return meta with hasNextPage as boolean", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.meta.hasNextPage).toBe("boolean");
  });

  it("should return meta with total count", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBeDefined();
  });

  it("should respect limit parameter", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=2")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBeLessThanOrEqual(2);
  });

  it("should not allow unauthenticated access", async () => {
    const res = await request(app).get("/api/admin/users?page=1&limit=5");
    expect(res.status).toBe(401);
  });

  it("should not allow parent to access admin users", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=5")
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(403);
  });

  // ── GET USER BY ID (use adminId which we know exists) ──
  it("should get a user by ID", async () => {
    const res = await request(app)
      .get(`/api/admin/users/${adminId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
  });

  it("should return user with email field", async () => {
    const res = await request(app)
      .get(`/api/admin/users/${adminId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBeDefined();
  });

  it("should return 404 for non-existent user", async () => {
    const res = await request(app)
      .get("/api/admin/users/000000000000000000000000")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  // ── UPDATE USER (use adminId) ──
  it("should update a user as admin", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${adminId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ username: `admin_${Date.now()}` });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User updated");
  });

  it("should not allow parent to update users", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${adminId}`)
      .set("Authorization", `Bearer ${parentToken}`)
      .send({ username: "hacked" });
    expect(res.status).toBe(403);
  });

  // ── DELETE USER ──
  it("should not allow parent to delete users", async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${adminId}`)
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(403);
  });

  it("should delete a user as admin", async () => {
    // Register a fresh temp user to delete
    const id      = Date.now();
    const tmpUser = { email: `tmp_${id}@gmail.com`, username: `tmp_${id}`, password: "Password123" };
    const regRes  = await request(app).post("/api/auth/register").send(tmpUser);
    const tmpId   = regRes.body.user?.id;

    const res = await request(app)
      .delete(`/api/admin/users/${tmpId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User deleted");
  });
});