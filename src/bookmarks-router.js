const express = require('express')
const xss = require('xss')
const BookmarxService = require('./bookmarx-service')

const bookmarxRouter = express.Router()
const jsonParser = express.json()

const serializeBookmark = bookmarx => ({
  id: bookmarx.id,
  name: bookmarx.name,
  bookmark_url: xss(bookmarx.bookmark_url),
  bookmark_description: xss(bookmarx.bookmark_description),
  date_added: bookmarx.date_added,
})

bookmarxRouter
  .route('/')
  .get((req, res, next) => {
      console.log('get all')
    const knexInstance = req.app.get('db')
    BookmarxService.getAllBookmarks(knexInstance)
      .then(bookmarx => {
        res.json(bookmarx.map(serializeBookmark))
      })
      .catch(next)
   })
  .post(jsonParser, (req, res, next) => {
    const { name, bookmark_url, rating, bookmark_description } = req.body
    const newBookmark = { name, bookmark_url, rating, bookmark_description }

    for (const [key, value] of Object.entries(newBookmark))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    BookmarxService.insertBookmark(
      req.app.get('db'),
      newBookmark
    )
      .then(bookmark => {
        res
          .status(201)
          .location(`/bookmarx/${bookmark.id}`)
          .json(serializeBookmark(bookmark))
      })
      .catch(next)
  })

// bookmarxRouter
//   .route('/:bookmarx_id')
//   .all((req, res, next) => {
//     BookmarxService.getById(
//       req.app.get('db'),
//       req.params.bookmarx_id
//     )
//       .then(bookmark => {
//         if (!bookmark) {
//           return res.status(404).json({
//             error: { message: `Bookmark doesn't exist` }
//           })
//         }
//         res.bookmark = bookmark
//         next()
//       })
//       .catch(next)
//   })
//   .get((req, res, next) => {
//     res.json(serializeBookmark(res.bookmark))
//   })
//   .delete((req, res, next) => {
//     BookmarxService.deleteBookmark(
//       req.app.get('db'),
//       req.params.bookmarx_id
//     )
//       .then(numRowsAffected => {
//         res.status(204).end()
//       })
//       .catch(next)
//   })

module.exports = bookmarxRouter