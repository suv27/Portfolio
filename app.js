const express = require(`express`);
const app = express();
const port = 4000;
const { Pool, Client } = require('pg');
const parser = require('body-parser');
app.use(parser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'postgres',
//     password: '#BeastMode27',
//     port: 5432,
// });

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: true,
// });

let newObj = {};

app.get(`/`, (req, res) => {
  res.render('index', {

  });
});

app.get('*', (req, res) => {
  res.status(404);
  res.send('PAGE NOT FOUND');
});

app.listen(process.env.PORT || port, (req, res) => {
  console.log(`Listening to port ${port}...`);
});
