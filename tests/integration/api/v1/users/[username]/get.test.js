import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator";

describe("GET /api/v1/users/[username]", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
  });

  describe("Anonymous user", () => {
    it("With exact case match", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
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

      expect(response1.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/john_doe",
      );
      const body2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(body2).toEqual({
        id: body2.id,
        username: "john_doe",
        email: "johndoe@gmail.com",
        password: "12345678",
        created_at: body2.created_at,
        updated_at: body2.updated_at,
      });
      expect(uuidVersion(body2.id)).toBe(4);
      expect(Date.parse(body2.created_at)).not.toBeNaN();
      expect(Date.parse(body2.updated_at)).not.toBeNaN();
    });

    it("With case mismatch", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "John_Doe_1",
          email: "johnDoe_1@gmail.com",
          password: "12345678",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/john_doe_1",
      );
      const body2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(body2).toEqual({
        id: body2.id,
        username: "John_Doe_1",
        email: "johnDoe_1@gmail.com",
        password: "12345678",
        created_at: body2.created_at,
        updated_at: body2.updated_at,
      });
      expect(uuidVersion(body2.id)).toBe(4);
      expect(Date.parse(body2.created_at)).not.toBeNaN();
      expect(Date.parse(body2.updated_at)).not.toBeNaN();
    });

    it("With nonexistent username", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/john_doe_10",
      );
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({
        name: "NotFoundError",
        message: "Usuário não encontrado.",
        action: "Verifique o username informado.",
        status_code: 404,
      });
    });
  });
});
