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
  });
});
