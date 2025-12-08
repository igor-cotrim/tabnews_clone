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
      const createdUser = await orchestrator.createUser({
        username: "john_doe",
      });

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/john_doe",
      );
      const body2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(body2).toEqual({
        id: body2.id,
        username: "john_doe",
        email: createdUser.email,
        password: body2.password,
        created_at: body2.created_at,
        updated_at: body2.updated_at,
      });
      expect(uuidVersion(body2.id)).toBe(4);
      expect(Date.parse(body2.created_at)).not.toBeNaN();
      expect(Date.parse(body2.updated_at)).not.toBeNaN();
    });

    it("With case mismatch", async () => {
      const createdUser = await orchestrator.createUser({
        username: "John_Doe_1",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/john_doe_1",
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        id: body.id,
        username: createdUser.username,
        email: createdUser.email,
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });
      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
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
