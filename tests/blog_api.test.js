const assert = require('node:assert')
const { test, describe, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)

  await helper.getTestToken()
})

describe('when there are initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)
    assert(titles.includes(helper.initialBlogs[0].title))
  })

  test('blogs are returned as JSON and contain id property instead of _id', async () => {
    const response = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogs = response.body
    blogs.forEach(blog => {
      assert.ok(blog.id, 'blog should have id property')
      assert.strictEqual(blog._id, undefined, 'blog should NOT have _id property')
    })
  })
})

describe('viewing a specific blog', () => {
  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.deepStrictEqual(resultBlog.body, blogToView)
  })
})

describe('adding a blog', () => {
  test('a valid blog can be added', async () => {
    const token = await helper.getTestToken()

    const newBlog = {
      title: 'Test title 3',
      likes: 0,
      author: 'Gregory B',
      url: 'www.example.com'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const contents = blogsAtEnd.map(r => r.title)
    assert(contents.includes('Test title 3'))
  })

  test('a blog without a title cannot be added', async () => {
    const token = await helper.getTestToken()

    const newBlog = {
      likes: 0,
      author: 'Gregory B',
      url: 'www.example.com'
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
  })

  test('blogs that are created without a likes property default to 0', async () => {
    const token = await helper.getTestToken()

    const newBlog = {
      title: "New blog without likes",
      author: 'Gregory B',
      url: 'www.example.com'
    }

    const savedBlog = await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(savedBlog.body.likes, 0)
  })
})

describe('deletion of a blog', () => {

  test('a specific blog can be deleted with valid token', async () => {
    const token = await helper.getTestToken()

    const newBlog = {
      title: "New blog without likes",
      author: 'Gregory B',
      url: 'www.example.com'
    }

    const savedBlog = await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsBeforeDelete = await helper.blogsInDb()
    const contentsBeforeDelete = blogsBeforeDelete.map(n => n.title)
    assert(contentsBeforeDelete.includes(savedBlog.body.title))
    
    await api
      .delete(`/api/blogs/${savedBlog.body.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    const contents = blogsAtEnd.map(n => n.title)

    assert(!contents.includes(savedBlog.body.title))
    assert.strictEqual(blogsAtEnd.length, blogsBeforeDelete.length - 1)
  })

  test('a specific blog cannot be deleted by another user', async () => {
    const token = await helper.getTestToken()
    const anotherUserToken = await helper.getTestToken({
      username: 'anotheruser',
      name: 'Another User',
      password: 'password'
    })

    const newBlog = {
      title: "New blog without likes",
      author: 'Gregory B',
      url: 'www.example.com'
    }

    const savedBlog = await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsBeforeDelete = await helper.blogsInDb()
    const contentsBeforeDelete = blogsBeforeDelete.map(n => n.title)
    assert(contentsBeforeDelete.includes(savedBlog.body.title))
    
    await api
      .delete(`/api/blogs/${savedBlog.body.id}`)
      .set('Authorization', `Bearer ${anotherUserToken}`)
      .expect(401)
  })

  test('deleting a blog requires a token', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)
  })
})

describe('updating a blog', () => {
  test('a specific blog can be updated', async() => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({...blogToUpdate, likes: blogToUpdate.likes + 1})
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(updatedBlog.body.likes, blogToUpdate.likes + 1)
  })
})

after(async () => {
  await mongoose.connection.close()
})
