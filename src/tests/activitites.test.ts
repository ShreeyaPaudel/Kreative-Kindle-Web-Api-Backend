import request from "supertest";
import app from "../app";

jest.setTimeout(30000);

describe("Activities Integration Tests", () => {
  let adminToken: string;
  let parentToken: string;
  let createdActivityId: string;

  const adminUser  = { email: "admin_act@gmail.com",  username: "admin_act",  password: "Admin123", role: "admin" };
  const parentUser = { email: "parent_act@gmail.com", username: "parent_act", password: "Parent123" };

  beforeAll(async () => {
    await request(app).post("/api/auth/register").send(adminUser);
    const adminLogin = await request(app).post("/api/auth/login").send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLogin.body.token;

    await request(app).post("/api/auth/register").send(parentUser);
    const parentLogin = await request(app).post("/api/auth/login").send({ email: parentUser.email, password: parentUser.password });
    parentToken = parentLogin.body.token;
  });

  // ── SEED ──
  it("should seed activities as admin", async () => {
    const res = await request(app)
      .post("/api/activities/seed")
      .set("Authorization", `Bearer ${adminToken}`);
    expect([200, 201]).toContain(res.status);
    expect(res.body.message).toBeDefined();
  });

  it("should not allow parent to seed activities", async () => {
    const res = await request(app)
      .post("/api/activities/seed")
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(403);
  });

  // ── GET ALL ──
  it("should get all activities as parent", async () => {
    const res = await request(app)
      .get("/api/activities")
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should not get activities without token", async () => {
    const res = await request(app).get("/api/activities");
    expect(res.status).toBe(401);
  });

  it("should return activities with required fields", async () => {
    const res = await request(app)
      .get("/api/activities")
      .set("Authorization", `Bearer ${parentToken}`);
    if (res.body.length > 0) {
      const activity = res.body[0];
      expect(activity.title).toBeDefined();
      expect(activity.category).toBeDefined();
      expect(activity.age).toBeDefined();
    }
    expect(res.status).toBe(200);
  });

  // ── CREATE ──
  it("should create a new activity as admin", async () => {
    const res = await request(app)
      .post("/api/admin/activities")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title:       "Test Activity",
        category:    "Art",
        age:         "Ages 3–6",
        duration:    "20 min",
        description: "A test activity",
        image:       "/images/test.png",
        materials:   ["Paper", "Pencil"],
        steps:       ["Step one", "Step two"],
      });
    expect(res.status).toBe(201);
    expect(res.body.data._id).toBeDefined();
    createdActivityId = res.body.data._id;
  });

  it("should not create activity without title", async () => {
    const res = await request(app)
      .post("/api/admin/activities")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ category: "Art", age: "Ages 3–6", duration: "20 min", description: "No title" });
    expect(res.status).toBe(400);
  });

  it("should not allow parent to create activity", async () => {
    const res = await request(app)
      .post("/api/admin/activities")
      .set("Authorization", `Bearer ${parentToken}`)
      .send({ title: "Hack", category: "Art", age: "Ages 3–6", duration: "20 min", description: "test" });
    expect(res.status).toBe(403);
  });

  // ── GET BY ID ──
  it("should get activity by ID", async () => {
    const res = await request(app)
      .get(`/api/activities/${createdActivityId}`)
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Test Activity");
  });

  it("should return 404 for non-existent activity", async () => {
    const res = await request(app)
      .get("/api/activities/000000000000000000000000")
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(404);
  });

  // ── UPDATE ──
  it("should update activity as admin", async () => {
    const res = await request(app)
      .put(`/api/admin/activities/${createdActivityId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Updated Activity" });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Updated Activity");
  });

  it("should not allow parent to update activity", async () => {
    const res = await request(app)
      .put(`/api/admin/activities/${createdActivityId}`)
      .set("Authorization", `Bearer ${parentToken}`)
      .send({ title: "Hacked" });
    expect(res.status).toBe(403);
  });

  // ── DELETE ──
  it("should delete activity as admin", async () => {
    const res = await request(app)
      .delete(`/api/admin/activities/${createdActivityId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it("should not allow parent to delete activity", async () => {
    const res = await request(app)
      .delete(`/api/admin/activities/000000000000000000000000`)
      .set("Authorization", `Bearer ${parentToken}`);
    expect(res.status).toBe(403);
  });
});