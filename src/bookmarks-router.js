const express = require('express')
const bookmarkRouter = express.Router()
const uuid = require('uuid/v4')
const logger = require('./logger')
const bookmarks = require('./store');


bookmarkRouter
    .route('/')
    .get((req, res) => {
        console.log(bookmarks);
        res.json(bookmarks);

    })
// .post((req, res) => {

// })

bookmarkRouter
    .route('/:id')
    .get((req, res) => {
        const { id } = req.params;
        const bookmark = bookmark.find(b => b.id == id);
        if (!bookmark) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res.status(404).send('Bookmark not found');
        }

        res.json(bookmark);
    })
// .delete((req, res) => {

// })

module.exports = bookmarkRouter