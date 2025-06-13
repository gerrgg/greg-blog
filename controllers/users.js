const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("blogs", {title: 1, author: 1, url: 1, likes: 1});
  response.json(users);
});

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  if(! username ){
    return response.status(400).json({ error: "username is required" });
  }

  if(username.length < 3){
    return response.status(400).json({ error: "username must be at least 3 characters long" });
  }

  if(! password ){
    return response.status(400).json({ error: "password is required" });
  }

  if(password.length < 8){
    return response.status(400).json({ error: "password must be at least 8 characters long" });
  }
  

  const saltRounds = 10;

  // Check if username and password are provided
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

module.exports = usersRouter;
