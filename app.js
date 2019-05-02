const express = require(`express`);
const app = express();
const port = 4000;
const parser = require('body-parser');
const nodemailer = require('nodemailer');
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

app.get(`/projects`, (req, res) => {
  res.render('projects', {

  });
});

app.get(`/contact`, (req, res) => {
  res.render('contact', {

  });
});

app.post('/contact/send', (req, res) => {

  let name = req.body.name;
  let email = req.body.email;
  let message = req.body.message;

  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'starlinu33@gmail.com',
      pass: 'jesucristos'
    }
  })

  let mailOptions = {
    to: 'starlinu33@gmail.com',
    subject: 'Website Submission',
    html: '<p>You have a submission with the following details...</p><ul><li>Name: ' + name + '</li><li>Email: ' + email + '</li><li>Message: ' + message + '</li></ul>',
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if(error){
      console.log(error);
      res.redirect('/');
    } else {
      console.log('Message sent: ' + info.response);

      // create a popup box where it says message sent

      res.redirect('/');
    }
  })
})

app.get('*', (req, res) => {
  res.status(404);
  res.send('PAGE NOT FOUND');
});

app.listen(process.env.PORT || port, (req, res) => {
  console.log(`Listening to port ${port}...`);
});
