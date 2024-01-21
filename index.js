// importing the needed modules
import pg from 'pg';
import axios from 'axios';
import express from 'express';
import bodyParser from 'body-parser';
import { render } from "ejs";


// creating object of the modules

const app = express();
const port = 3000;
const db = new pg.Client({
    user: "postgres",
    password: "prince4god",
    database: "shelf",
    port: 5432,
    host: "localhost",

});

db.connect();

// Setting up the middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
// getting all the records and displaying them on the home page
app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM book INNER JOIN author ON book.author_id = author.author_id");
        let items = result.rows;

        res.render("index.ejs", {
            data: items,
            title: "Book reviews",
        });


    } catch (err) {
        console.log(err);
    }

});

// getting note of a book by id

app.get("/notes/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await db.query("SELECT * FROM book INNER JOIN author ON book.author_id = author.author_id WHERE book_id=$1", [id]);
        let item = result.rows[0];
        console.log(item)
        res.render("notes.ejs",
            {
                data: item,

            });


    } catch (err) {
        console.log(err);
    }

});
// arranging the records according to newest
app.get("/newest", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM book INNER JOIN author ON book.author_id = author.author_id ORDER BY date DESC");
        let items = result.rows;
        console.log(items)
        res.render("index.ejs", {
            data: items,
            title: "Book reviews",
        });


    } catch (err) {
        console.log(err);
    }


})
// arranging the records according to title
app.get("/title", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM book INNER JOIN author ON book.author_id = author.author_id ORDER BY title ASC");
        let items = result.rows;
        console.log(items)
        res.render("index.ejs", {
            data: items,
            title: "Book reviews",
        });


    } catch (err) {
        console.log(err);
    }


});

// arranging the records according to title
app.get("/best", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM book INNER JOIN author ON book.author_id = author.author_id ORDER BY rating DESC");
        let items = result.rows;
        console.log(items)
        res.render("index.ejs", {
            data: items,
            title: "Book reviews",
        });


    } catch (err) {
        console.log(err);
    }


});

// Admin home page


app.get("/admin", async (req, res) => {

    res.render("form.ejs", {
        title: "Add book",
    });

});

// posting book records
app.post("/admin", async (req, res) => {
    try {
        const authorResult = await db.query(
            "INSERT INTO author (author_name) VALUES ($1) RETURNING author_id",
            [req.body.author.toUpperCase()]
        );

        const authorId = authorResult.rows[0].author_id;
        const response = await axios.get(`https://covers.openlibrary.org/b/isbn/${req.body.isbn}.json`);
        const result = response.data;

        await db.query(
            "INSERT INTO book (title, date, rating, isbn, description, note,img, author_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
            [
                req.body.title.toUpperCase(),
                req.body.date,
                req.body.rating,
                req.body.isbn,
                req.body.description,
                req.body.note,
                result.source_url,
                authorId,
            ]
        );

        res.redirect("/");
    } catch (err) {
        console.log(err);
        res.redirect("/admin");
    }
});

app.listen(port, () => {
    console.log(`The server is running on port ${port}`);
});





