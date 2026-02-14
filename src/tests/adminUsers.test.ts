import request from "supertest";
import app from "../app";

describe("Admin Users Integration", () => {
  let adminToken: string;

  const adminUser = {
    email: "admin_test@gmail.com",
    username: "admin_test",
    password: "Admin123",
    role: "admin",
  };

  beforeAll(async () => {
    await request(app)
      .post("/api/auth/register")
      .send(adminUser);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminUser.email,
        password: adminUser.password,
      });

    adminToken = loginRes.body.token;
  });

  it("should get paginated users", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.users).toBeDefined();
    expect(res.body.meta).toBeDefined();
  });

  it("should not allow non-admin access", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=5");

    expect(res.status).toBe(401);
  });


  describe("Admin Users Pagination", () => {

  it("should return page meta", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.body.meta).toBeDefined();
  });

  it("should contain totalPages", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.body.meta.totalPages).toBeDefined();
  });

  it("should contain hasNextPage", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(typeof res.body.meta.hasNextPage).toBe("boolean");
  });

  it("should return users array", async () => {
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(Array.isArray(res.body.users)).toBe(true);
  });

});

});
