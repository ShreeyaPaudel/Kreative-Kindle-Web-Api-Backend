import request from "supertest";
import app from "../app";

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

  it("should login user", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();

    token = res.body.token;
  });

  it("should fail login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "wrongpassword",
      });

    expect(res.status).toBe(401);
  });

  it("should request forgot password", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: testUser.email });

    expect(res.status).toBe(200);
  });

  it("should reject protected route without token", async () => {
    const res = await request(app)
      .get("/api/admin/users");

    expect(res.status).toBe(401);
  });

  describe("Auth Flow", () => {

  it("should fail login with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@email.com",
        password: "wrongpass"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should require email for forgot password", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({});

    expect(res.statusCode).toBe(400);
  });

});

});
