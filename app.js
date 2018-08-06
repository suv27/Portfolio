const express = require(`express`);
const app = express();
const port = 4000;
const { Pool, Client } = require('pg');
const parser = require('body-parser');
app.use(parser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

let newObj = {};

app.get(`/`, (req, res) => {
  res.render('home', {

  });
});

app.get(`/about`, (req, res) => {
  res.render('about', {

  });
});

app.get('*', (req, res) => {
  res.status(404);
  res.send('PAGE NOT FOUND');
});

app.listen(process.env.PORT || port, (req, res) => {
  console.log(`Listening to port ${port}...`);
});
