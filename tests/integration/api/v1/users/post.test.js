import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator";

describe("POST /api/v1/users", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
  });

  describe("Anonymous user", () => {
    it("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "john_doe",
          email: "johndoe@gmail.com",
          password: "12345678",
        }),
      });
      const body = await response.json();

      expect(response.status).toBe(201);
      expect(body).toEqual({
        id: body.id,
        username: "john_doe",
        email: "johndoe@gmail.com",
        password: "12345678",
        created_at: body.created_at,
        updated_at: body.updated_at,
      });
      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
    });

    it("With duplicated 'email'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "john_doe_1",
          email: "johndoe_1@gmail.com",
          password: "12345678",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "john_doe_2",
          email: "Johndoe_1@gmail.com",
          password: "12345678",
        }),
      });
      const body = await response2.json();

      expect(response2.status).toBe(400);
      expect(body).toEqual({
        name: "ValidationError",
        message: "O email informado já está em uso.",
        action: "Utilize outro email.",
        status_code: 400,
      });
    });

    it("With duplicated 'username'", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "john_doe_3",
          email: "johndoe_3@gmail.com",
          password: "12345678",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "John_doe_3",
          email: "Johndoe3@gmail.com",
          password: "12345678",
        }),
      });
      const body = await response2.json();

      expect(response2.status).toBe(400);
      expect(body).toEqual({
        name: "ValidationError",
        message: "O username informado já está em uso.",
        action: "Utilize outro username.",
        status_code: 400,
      });
    });
  });
});
