import database from "infra/database.js";
import orchestrator from "tests/orchestrator";

describe("POST /api/v1/migrations", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await database.query("drop schema public cascade; create schema public;");
  });

  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      it("For the first time", async () => {
        const res = await fetch("http://localhost:3000/api/v1/migrations", {
          method: "POST",
        });
        const body = await res.json();

        expect(res.status).toBe(201);
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThan(0);
      });

      it("For the second time", async () => {
        const res = await fetch("http://localhost:3000/api/v1/migrations", {
          method: "POST",
        });
        const body = await res.json();

        expect(res.status).toBe(200);
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(0);
      });
    });
  });
});
