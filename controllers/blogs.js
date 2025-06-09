const blogRouter = require('express').Router()
const Blog = require('../models/Blog')

blogRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogRouter.get('/:id', async (request, response, next) => {
  const blog = await Blog.findById(request.params.id)
  if(blog){
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogRouter.delete('/:id', async (request, response, next) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogRouter.post('/', async (request, response, next) => {
  const body = request.body

  const blog = new Blog({
    title: body.title,
    author: body.author ?? '',
    url: body.url ?? '',
    likes : body.likes ?? 0
  })

  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

blogRouter.put('/:id', async (request, response, next) => {
  const { title, author, likes, url } = request.body

  const blogToUpdate = await Blog.findById(request.params.id)

  if (!blogToUpdate) {
    return response.status(404).end()
  }

  blogToUpdate.title = title
  blogToUpdate.author = author
  blogToUpdate.likes = likes
  blogToUpdate.url = url

  const savedBlog = await blogToUpdate.save()  
  response.json(savedBlog)
})

module.exports = blogRouter