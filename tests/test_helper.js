const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require("../models/blog");
const User = require("../models/user");

const initialBlogs = [
  {
    title: "HTML is easy",
    likes: 10,
  },
  {
    title: "Browser can execute only JavaScript",
    likes: 20,
  },
];

const initialUsers = [
  {
    username: "root",
    name: "Superuser",
    password: "password",
  },
  {
    username: "user1",
    name: "User One",
    password: "password1",
  },
];

const nonExistingId = async () => {
  const blog = new Blog({ title: "willremovethissoon" });
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

const getTestToken = async (testUser = false) => {
  if( ! testUser ){
    testUser = {
      username: 'testuser',
      name: 'Test User',
      password: 'password'
    };
  }

  // Check if the user already exists
  const existingUser = await User.findOne({ username: testUser.username });

  if (!existingUser) {
    await api.post('/api/users').send(testUser);
  }

  // Login user and get token
  const loginResponse = await api.post('/api/login').send({
    username: testUser.username,
    password: testUser.password
  });

  return loginResponse.body.token;
};



module.exports = {
  initialBlogs,
  initialUsers,
  nonExistingId,
  blogsInDb,
  usersInDb,
  getTestToken
};
