'use strict'
const Loki = require('lokijs')
const db = new Loki('public/posts.json', { persistenceMethod: 'fs' })
const loadCollection = (collectionName, db) => {
  return new Promise(resolve => {
    db.loadDatabase({}, () => {
      const collection = db.getCollection(collectionName) || db.addCollection(collectionName)
      resolve(collection)
    })
  })
}

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
 * Resourceful controller for interacting with posts
 */
class PostController {
  /**
   * Show a list of all posts.
   * GET posts
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index ({ request, response, view }) {
    // loadCollection('posts')
    //   .then((collection) => {
    //     const ectities = collection.chain().find().simplesort('$loki', 'isdesc').data()
    //     console.log(ectities)
    //   })
    const all = request.all()
    const posts = await loadCollection('posts', db)
    if (all.type == 'json') {
      return posts.data
    }
    return view.render('posts.index', {
      posts: posts.data
    })
  }

  /**
   * Render a form to be used for creating a new post.
   * GET posts/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async create ({ request, response, view }) {
    return view.render('posts.create')
  }

  /**
   * Create/save a new post.
   * POST posts
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store ({ request, response, view }) {
    const all = request.all()
    const collection = await loadCollection('posts', db)
    const result = collection.insert({
      title: all.title,
      image: all.image,
      content: all.content
    })
    db.saveDatabase()

    return response.route(`/posts/edit/${ result['$loki'] }`, { result })
  }

  /**
   * Display a single post.
   * GET posts/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show ({ params, request, response, view }) {
  }

  /**
   * Render a form to update an existing post.
   * GET posts/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async edit ({ params, request, response, view }) {
    const posts = await loadCollection('posts', db)
    const post = posts.get(params.id)
    return view.render('posts.edit', { id: params.id, post })
  }

  /**
   * Update post details.
   * PUT or PATCH posts/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update ({ params, request, response, view }) {
    const all = request.all()
    const posts = await loadCollection('posts', db)
    const post = posts.get(all.id)

    if (all.button == 'submit') {
      post.title = all.title
      post.image = all.image
      post.content = all.content
      posts.update(post)
      db.saveDatabase()
      return response.route(`/posts/edit/${ all.id }`, { post })
    }

    if (all.button == 'delete') {
      posts.remove(post)
      db.saveDatabase()
      return response.route(`/posts`)
    }
  }

  /**
   * Delete a post with id.
   * DELETE posts/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy ({ params, request, response }) {
  }
}

module.exports = PostController
