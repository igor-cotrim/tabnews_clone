import orchestrator from "tests/orchestrator";

describe("POST /api/v1/status", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
  });

  describe("Anonymous user", () => {
    it("Retriving current system status", async () => {
      const res = await fetch("http://localhost:3000/api/v1/status", {
        method: "POST",
      });
      const body = await res.json();

      expect(res.status).toBe(405);
      expect(body).toEqual({
        name: "MethodNotAllowedError",
        message: "Método não permitido para este endpoint.",
        action:
          "Verifique se o método HTTP enviado é válido para este endpoint.",
        status_code: 405,
      });
    });
  });
});
