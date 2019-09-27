const express = require('express')
const uuid = require('uuid/v4')
const { isWebUri } = require('valid-url')
const logger = require('./logger')
const bookmarks = require('./store');

const bookmarkRouter = express.Router()
const bodyParser = express.json()

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {
        console.log(bookmarks);
        res.json(bookmarks);

    })
   .post(bodyParser, (req, res) => {
        const { title, url, rating, description } = req.body;

        if(!title) {
            logger.error(`Please enter a title`);
            return res
                .status(400)
                .send(`Invalid Title`);
        }

        if(!isWebUri(url)) {
            logger.error(`Please enter a url`);
            return res
                .status(400)
                .send(`Invalid URL`);
        }

        if(!rating || typeof(rating) !== 'number' || rating < 1 || rating > 5) {
            logger.error(`Please enter a rating between 1 and 5`);
            return res
                .status(400)
                .send(`Invalid rating-- must enter a number between 1 and 5`);
        }

        const id = uuid();

        const bookmark = {
            id,
            title,
            url,
            rating,
            description
        }

        bookmarks.push(bookmark);

        logger.info(`Bookmark with the id ${id} was created`)

        res
            .status(201)
            .location(`https://localhost:8000/bookmarks/${id}`)
            .json(bookmark);
   });

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params;
        const bookmark = bookmarks.find(b => b.id == id);
        if (!bookmark) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res.status(404).send('Bookmark not found');
        }

        res.json(bookmark);
    })
   .delete((req, res) => {
    const { id } = req.params;

    const bookmarkIndex = bookmarks.findIndex(b => b.id == id);
    
    if (bookmarkIndex === -1) {
        logger.error(`Bookmark with id ${id} not found.`);
        return res
            .status(404)
            .send('Not found');
    }

    bookmarks.splice(bookmarkIndex, 1);

    logger.info(`Bookmark with the id ${id} was deleted. `);

    res
        .status(204)
        .end();
   })

module.exports = bookmarkRouter