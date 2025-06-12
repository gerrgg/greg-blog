const assert = require("node:assert");
const { test, describe, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const helper = require("./test_helper");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const api = supertest(app);

describe("when there is initially one user in the db", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("password", 10);

    const user = new User({
      username: "testuser",
      name: "Test User",
      passwordHash,
    });

    await user.save();
  });

  test("creation succeeds with a valid username and password", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "newuser2",
      name: "New User",
      password: "newpassword",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test("creation fails with a duplicate username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "testuser",
      name: "Duplicate User",
      password: "duplicatepassword",
    };

    const result = await api.post("/api/users").send(newUser).expect(400);

    assert.strictEqual(result.body.error, "username must be unique");

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  test("creation fails when username is not provided", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      name: "No Username User",
      password: "nopassword",
    };

    const result = await api.post("/api/users").send(newUser).expect(400);

    assert.strictEqual(result.body.error, "username is required");

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
