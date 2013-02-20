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

mailer.extend(app, config.mailer);

app.locals.testVariable = 'Test Variable';
app.locals.testFunction = function () {
  return 'Test Function';
};

// Views
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Configuration

app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.render('index', {
    title: 'Home'
  });
});

app.get('/send-mail-via-app', function (req, res) {
  res.render('send-mail-via-app', {
    title: 'Send Mail Via App'
  });
});

app.post('/send-mail-via-app', function (req, res) {

  if(!req.body.user || !req.body.user.email) {
    res.redirect('back');
    return;
  };

  app.sendEmail('email', {
    to: req.body.user.email,
    subject: 'Test Email'
  },
  function (err) {
    if (err) {
      console.log('Sending Mail Failed!');
      console.log(err);
      return;
    };
    res.redirect('/');
  });

});

app.get('/send-mail-via-res', function (req, res) {
  res.render('send-mail-via-res', {
    title: 'Send Mail Via Response'
  });
});

app.post('/send-mail-via-res', function (req, res) {

  if(!req.body.user || !req.body.user.email) {
    res.redirect('back');
    return;
  };

  app.sendEmail('email', {
    to: req.body.user.email,
    subject: 'Test Email'
  },
  function (err) {
    if (err) {
      console.log('Sending Mail Failed!');
      console.log(err);
      return;
    };
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