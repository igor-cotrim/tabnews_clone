import { version as uuidVersion } from "uuid";

import orchestrator from "tests/orchestrator";
import user from "models/user";
import password from "models/password";

describe("PATCH /api/v1/users/[username]", () => {
  beforeAll(async () => {
    await orchestrator.waitForAllServices();
    await orchestrator.clearDatabase();
    await orchestrator.runPendingMigrations();
  });

  describe("Anonymous user", () => {
    it("With nonexistent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/nonexistent_user",
        {
          method: "PATCH",
        },
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

    it("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "john_doe_1",
      });

      await orchestrator.createUser({
        username: "john_doe_2",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/john_doe_2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "John_doe_1",
          }),
        },
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({
        name: "ValidationError",
        message: "O username informado já está em uso.",
        action: "Utilize outro username.",
        status_code: 400,
      });
    });

    it("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "johndoe_3@gmail.com",
      });

      const createdUser = await orchestrator.createUser({
        email: "johndoe_4@gmail.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "johndoe_3@gmail.com",
          }),
        },
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({
        name: "ValidationError",
        message: "O email informado já está em uso.",
        action: "Utilize outro email.",
        status_code: 400,
      });
    });

    it("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "john_doe_5_updated",
          }),
        },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        id: body.id,
        username: "john_doe_5_updated",
        email: createdUser.email,
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });
      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
      expect(body.updated_at > body.created_at).toBeTruthy();
    });

    it("With unique 'email'", async () => {
      const createdUser = await orchestrator.createUser();

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "johndoe_6_updated@gmail.com",
          }),
        },
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({
        id: body.id,
        username: createdUser.username,
        email: "johndoe_6_updated@gmail.com",
        password: body.password,
        created_at: body.created_at,
        updated_at: body.updated_at,
      });
      expect(uuidVersion(body.id)).toBe(4);
      expect(Date.parse(body.created_at)).not.toBeNaN();
      expect(Date.parse(body.updated_at)).not.toBeNaN();
      expect(body.updated_at > body.created_at).toBeTruthy();
    });

    it("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        password: "12345678",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "12345678_new",
          }),
        },
      );
      const body = await response.json();
      const userInDatabase = await user.findOneByUsername(createdUser.username);
      const correctPasswordMatch = await password.compare(
        "12345678_new",
        userInDatabase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        "12345678",
        userInDatabase.password,
      );

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
      expect(body.updated_at > body.created_at).toBeTruthy();
      expect(correctPasswordMatch).toBeTruthy();
      expect(incorrectPasswordMatch).toBeFalsy();
    });
  });
});
