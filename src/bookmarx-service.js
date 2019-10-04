const BookmarxService = {
    getAllBookmarks(knex) {
        return knex.select('*').from('bookmarx')
    },
    getById(knex, id) {
        return knex.from('bookmarx').select('*').where('id', id).first()
    },
    insertBookmark(knex, newBookmark) {
        return knex
            .insert(newBookmark)
            .into('bookmarx')
            .returning('*')
            .then(rows => {
              return rows[0]
            })
    },
    deleteBookmark(knex, id) {
      return knex('/bookmarx')
        .where({ id })
        .delete()
    }
}

module.exports = BookmarxService;