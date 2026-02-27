import request from "supertest";
import app from "../app";

jest.setTimeout(30000);

describe("Posts Integration Tests", () => {
  let parentToken: string;
  let adminToken: string;
  let createdPostId: string;

  const adminUser  = { email: "admin_posts@gmail.com",  username: "admin_posts",  password: "Admin123", role: "admin" };
  const parentUser = { email: "parent_posts@gmail.com", username: "parent_posts", password: "Parent123" };

  beforeAll(async () => {
    await request(app).post("/api/auth/register").send(adminUser);
    const adminLogin = await request(app).post("/api/auth/login").send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLogin.body.token;

    await request(app).post("/api/auth/register").send(parentUser);
    const parentLogin = await request(app).post("/api/auth/login").send({ email: parentUser.email, password: parentUser.password });
    parentToken = parentLogin.body.token;
  });

  // ── CREATE ──
  it("should create a post", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${parentToken}`)
      .field("caption", "My child did amazing today!");
    expect(res.status).toBe(201);
    expect(res.body.data._id).toBeDefined();
    createdPostId = res.body.data._id;
  });

  it("should not create post without caption", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${parentToken}`)
      .field("caption", "");
    expect(res.status).toBe(400);
  });

  it("should not create post without token", async () => {
    const res = await request(app)
      .post("/api/posts")
      .field("caption", "No auth");
    expect(res.status).toBe(401);
  });

  // ── GET ALL ──
  it("should get all posts", async () => {
    const res = await request(app)
      .get("/api/posts")
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should not get posts without token", async () => {
    const res = await request(app).get("/api/posts");
    expect(res.status).toBe(401);
  });

  it("should return posts with required fields", async () => {
    const res = await request(app)
      .get("/api/posts")
      .set("Authorization", `Bearer ${parentToken}`);
    if (res.body.length > 0) {
      expect(res.body[0].caption).toBeDefined();
      expect(res.body[0].username).toBeDefined();
    }
    expect(res.status).toBe(200);
  });

  // ── LIKE ──
  it("should like a post", async () => {
    const res = await request(app)
      .post(`/api/posts/${createdPostId}/like`)
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.likes).toBeDefined();
  });

  it("should toggle like off when liked again", async () => {
    const res = await request(app)
      .post(`/api/posts/${createdPostId}/like`)
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.liked).toBe(false);
  });

  it("should not like without token", async () => {
    const res = await request(app).post(`/api/posts/${createdPostId}/like`);
    expect(res.status).toBe(401);
  });

  // ── DELETE own post ──
  it("should delete own post", async () => {
    const res = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(200);
  });

  // ── ADMIN DELETE ──
  it("should allow admin to delete any post", async () => {
    // create a new post first
    const createRes = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${parentToken}`)
      .field("caption", "Admin will delete this");
    const postId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/posts/admin/${postId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it("should not allow parent to use admin delete route", async () => {
    const res = await request(app)
      .delete("/api/posts/admin/000000000000000000000000")
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(403);
  });
});