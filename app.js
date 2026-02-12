require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const session = require('express-session');
const flash = require('connect-flash');
const dns = require('node:dns');
const app = express();
const port = process.env.PORT || 4000;

// Middleware
dns.setDefaultResultOrder('ipv4first');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session & Flash Config
app.use(session({
  secret: 'portfolio-secret-key',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

// Global Variables for EJS (Automatically available in all views)
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// Routes
app.get('/', (req, res) => res.render('home'));
app.get('/about', (req, res) => res.render('about'));
app.get('/projects', (req, res) => res.render('projects'));
app.get('/contact', (req, res) => res.render('contact'));

app.post('/contact/send', async (req, res) => {
  // 1. Grab the stranger's info from the form
  const { name, email, message } = req.body;

  // 2. Set up YOUR identity (the middleman)
  const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false 
  }
});

  // 3. Define the email (From YOU, To YOU, containing THEIR message)
  const mailOptions = {
    from: process.env.EMAIL_USER, 
    to: process.env.EMAIL_USER,
    subject: `New Portfolio Message from ${name}`,
    html: `
      <p>You have a new contact request:</p>
      <ul>
        <li><strong>From:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
      </ul>
      <p><strong>Message:</strong> ${message}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    req.flash('success_msg', 'I received your message! I will get back to you soon.');
    res.redirect('/contact');
  } catch (error) {
    console.error("The 'middleman' failed to log in:", error);
    req.flash('error_msg', 'Sorry, my mail server is down. Please try again later.');
    res.redirect('/contact');
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).send('PAGE NOT FOUND'); 
});

app.listen(port, () => {
  console.log(`Listening to port ${port}...`);
});
