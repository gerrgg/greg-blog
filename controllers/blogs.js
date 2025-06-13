const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const {userExtractor} = require('../utils/middleware')

blogRouter.get('/', async (request, response, next) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
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

blogRouter.delete('/:id', userExtractor, async (request, response, next) => {
  const user = request.user

  const blogToDelete = await Blog.findById(request.params.id)

  if( !user || !blogToDelete || blogToDelete.user.toString() !== user._id.toString()) {
    return response.status(401).json({ error: 'userId is missing or invalid' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogRouter.post('/', userExtractor, async (request, response, next) => {
  const body = request.body
  const user = request.user

  if( !user) {
    return response.status(400).json({ error: 'userId is missing or invalid' })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author ?? '',
    url: body.url ?? '',
    likes : body.likes ?? 0,
    user: user._id
  })

  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

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