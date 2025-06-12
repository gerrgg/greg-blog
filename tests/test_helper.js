const Blog = require("../models/Blog");
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

module.exports = {
  initialBlogs,
  initialUsers,
  nonExistingId,
  blogsInDb,
  usersInDb,
};
