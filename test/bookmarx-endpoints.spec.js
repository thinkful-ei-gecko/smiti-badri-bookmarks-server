const knex = require('knex')
const app = require('../src/app')
const makeBookmarxArray = require('./bookmarx.fixtures')

describe('Bookmarx Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('bookmarx').truncate())

  afterEach('cleanup',() => db('bookmarx').truncate())

  describe.only(`GET /`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/')
          .expect(200, [])
      })
    })

    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarxArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarx')
          .insert(testBookmarks)
      })

      it('responds with 200 and all of the bookmarks', () => {
        return supertest(app)
          .get('/')
          .expect(200, testBookmarks)
      })
    })
  })
  describe(`GET /:bookmarx_id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456
        return supertest(app)
          .get(`/${bookmarkId}`)
          .expect(404, { error: { message: `Bookmark doesn't exist` } })
      })
    })

    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarxArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarx')
          .insert(testBookmarks)
      })

      it('responds with 200 and the specified bookmark', () => {
        const bookmarkId = 2
        const expectedBookmark = testbookmarks[bookmarkId - 1]
        return supertest(app)
          .get(`/${bookmarkId}`)
          .expect(200, expectedBookmark)
      })
    })
  })

  describe(`POST /`, () => {
    it(`creates an bookmark, responding with 201 and the new bookmark`, function() {
      this.retries(3)
      const newBookmark = {
        name: 'Test new bookmark',
        bookmark_url: 'https://www.bookmark.com',
        rating: 3,
        bookmark_description: 'test new bokmark description'
      }
      return supertest(app)
        .post('/')
        .send(newBookmark)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newBookmark.name)
          expect(res.body.bookmark_url).to.eql(newBookmark.bookmark_url)
          expect(res.body.rating).to.eql(newBookmark.rating)
          expect(res.body.bookmark_description).to.eql(newBookmark.bookmark_description)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/${res.body.id}`)
          const expected = new Date().toLocaleString()
          const actual = new Date(res.body.date_added).toLocaleString()
          expect(actual).to.eql(expected)
        })
        .then(res =>
          supertest(app)
            .get(`/${res.body.id}`)
            .expect(res.body)
        )
    })

    const requiredFields = ['name', 'bookmark_url', 'rating', 'bookmark_description']

    requiredFields.forEach(field => {
      const newBookmark = {
        name: 'Test new bookmark',
        bookmark_url: 'https://bookmark.com',
        rating: 4,
        bookmark_description: 'test bookmark description'
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newBookark[field]

        return supertest(app)
          .post('/bookmarx')
          .send(newBookmark)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })
  })

  describe(`DELETE /:bookmarx_id`, () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 404`, () => {
        const bookmarkId = 123456
        return supertest(app)
          .delete(`/${bookmarkId}`)
          .expect(404, { error: { message: `Bookmark doesn't exist` } })
      })
    })

    context('Given there are bookmarks in the database', () => {
      const testBookmarks = makeBookmarxArray()

      beforeEach('insert bookmarks', () => {
        return db
          .into('bookmarx')
          .insert(testBookmarks)
      })

      it('responds with 204 and removes the bookmark', () => {
        const idToRemove = 2
        const expectedBookmarks = testBookmarks.filter(bookmark => bookmark.id !== idToRemove)
        return supertest(app)
          .delete(`/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/`)
              .expect(expectedBookmarks)
          )
      })
    })
  })
 })


