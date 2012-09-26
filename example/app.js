/*!
 * express-mailer example
 */

/**
 * Module Dependencies
 */

var express = require('express'),
    app = module.exports = express(),
    mailer = require('../index'),
    config = require('./config');

// Views
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Configuration

app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));

app.use(mailer(config.mailer));

app.get('/', function (req, res) {
  res.render('index', {
    title: 'Home'
  });
});

app.get('/send-mail', function (req, res) {
  res.render('send-mail', {
    title: 'Send Mail'
  });
});

app.post('/send-mail', function (req, res) {

  var email = req.body.user.email;

  res.sendEmail('email', {
    to: email,
    subject: 'Test Email'
  },
  function (err) {
    if (err) {
      console.log(err);
      res.redirect('/send-mail');
      return;
    }
    res.redirect('/');
  });
  
});

// Error Handler
app.use(express.errorHandler());

/**
 * Module exports.
 */

if (!module.parent) {
  app.listen(8000);
  console.log('Express app started on port 8000');
};