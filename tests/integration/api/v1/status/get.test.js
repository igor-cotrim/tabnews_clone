import orchestrator from "tests/orchestrator";

describe("GET /api/v1/status", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
  });

  describe("Anonymous user", () => {
    it("Retriving current system status", async () => {
      const res = await fetch("http://localhost:3000/api/v1/status");
      const body = await res.json();
      const parsedUpdatedAt = new Date(body.updated_at).toISOString();

      expect(res.status).toBe(200);
      expect(body.updated_at).toBeDefined();
      expect(body.updated_at).toEqual(parsedUpdatedAt);
      expect(body.dependencies.database.version).toEqual("16.0");
      expect(body.dependencies.database.max_connections).toEqual(100);
      expect(body.dependencies.database.opened_connections).toEqual(1);
    });
  });
});
