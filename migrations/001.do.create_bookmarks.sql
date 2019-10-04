CREATE TABLE bookmarx (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    bookmark_url TEXT NOT NULL,
    rating INTEGER NOT NULL,
    bookmark_description TEXT,
    date_added TIMESTAMP DEFAULT now() NOT NULL
);
