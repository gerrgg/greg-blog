const assert = require('node:assert')
const { test, after, beforeEach, before } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/Blog')

const api = supertest(app)

const initialBlogs = [
  {
    "title": "How to Survive a JavaScript Singularity",
    "author": "Nova Byte",
    "url": "https://galacticdev.net/blog/js-singularity",
    "likes": 142
  },
  {
    "title": "React Quantum State Management",
    "author": "Quark Jenkins",
    "url": "https://galacticdev.net/blog/react-quantum-state",
    "likes": 187
  },
  {
    "title": "The Dark Side of Asynchronous Loops",
    "author": "Echo Loop",
    "url": "https://galacticdev.net/blog/async-darkness",
    "likes": 231
  },
]

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[2])
  await blogObject.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, initialBlogs.length)
})

test("a specific blog is within the returned blogs", async () => {
  const response = await api.get('/api/blogs')

  const titles = response.body.map(r => r.title)
  assert(titles.includes('The Dark Side of Asynchronous Loops'));
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Test title 3',
    likes: 0,
    author: 'Gregory B',
    url: 'www.example.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const contents = response.body.map(r => r.title)

  assert.strictEqual(response.body.length, initialBlogs.length + 1)

  assert(contents.includes('Test title 3'))
})

test('a blog without a title can not be added', async () => {
  const newBlog = {
    likes: 0,
    author: 'Gregory B',
    url: 'www.example.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, initialBlogs.length)
})


after(async () => {
  await mongoose.connection.close()
})