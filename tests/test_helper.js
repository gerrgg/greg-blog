const Blog = require('../models/Blog')

const initialBlogs = [
  {
    title: 'HTML is easy',
    likes: 10
  },
  {
    title: 'Browser can execute only JavaScript',
    likes: 20
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}