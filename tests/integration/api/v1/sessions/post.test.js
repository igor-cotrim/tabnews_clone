import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";

import orchestrator from "tests/orchestrator";
import session from "models/session";

describe("POST /api/v1/sessions", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
  });

  describe("Anonymous user", () => {
    it("With incorrect 'email' but correct 'password'", async () => {
      await orchestrator.createUser({
        password: "correct_password",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "wrong_email@gmail.com",
          password: "correct_password",
        }),
      });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({
        name: "UnauthorizedError",
        message: "Email ou senha incorretos.",
        action: "Verifique os dados informados.",
        status_code: 401,
      });
    });

    it("With correct 'email' but incorrect 'password'", async () => {
      await orchestrator.createUser({
        email: "correct_email@gmail.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "correct_email@gmail.com",
          password: "wrong_password",
        }),
      });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({
        name: "UnauthorizedError",
        message: "Email ou senha incorretos.",
        action: "Verifique os dados informados.",
        status_code: 401,
      });
    });

    it("With incorrect 'email' but incorrect 'password'", async () => {
      await orchestrator.createUser();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "incorrect_email@gmail.com",
          password: "wrong_password",
        }),
      });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({
        name: "UnauthorizedError",
        message: "Email ou senha incorretos.",
        action: "Verifique os dados informados.",
        status_code: 401,
      });
    });

    it("With correct 'email' but correct 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        email: "correct@gmail.com",
        password: "correct_password",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "correct@gmail.com",
          password: "correct_password",
        }),
      });
      const body = await response.json();
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });
      const expiresAt = new Date(body.expires_at);
      const createdAt = new Date(body.created_at);

      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);

      expect(response.status).toBe(201);
      expect(body).toEqual({
        id: body.id,
        token: body.token,
        user_id: createdUser.id,
        expires_at: body.expires_at,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });
      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.expires_at)).not.toBeNaN();
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
      expect(expiresAt - createdAt).toBe(session.EXPIRATION_IN_MILLISECONDS);
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: body.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
      });
    });
  });
});
