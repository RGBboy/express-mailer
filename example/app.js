/*!
 * express-mailer example
 */

/**
 * Module Dependencies
 */

var express = require('express'),
    app = express(),
    server = module.exports = require('http').createServer(app),
    mailer = require('../index'),
    config = require('./config')
    currentMailerOptions = config.mailer;

mailer.extend(app, currentMailerOptions);

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

// render mail

app.get('/render-mail', function (req, res) {
  app.mailer.render('email', {
    to: 'test@localhost',
    subject: 'Test Email',
    pretty: true
  },
  function (err, email) {
    if (err) {
      console.log('Sending Mail Failed!');
      console.log(err);
      return;
    };
    res.header('Content-Type', 'text/plain');
    res.send(email);
  });
});

// Send mail via the application object:

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

  app.mailer.send('email', {
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

// Send mail via the response object:

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

  res.mailer.send('email', {
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

// Send mail via an updated mailer object:

app.get('/send-mail-with-update', function (req, res) {
  res.render('send-mail-with-update', {
    title: 'Send Mail With Update'
  });
});

app.post('/send-mail-with-update', function (req, res, next) {

  if(!req.body.user || !req.body.user.email) {
    res.redirect('back');
    return;
  };

  if (currentMailerOptions === config.mailer) {
    currentMailerOptions = config.mailerUpdate;
  } else {
    currentMailerOptions = config.mailer;
  };

  app.mailer.update(currentMailerOptions, function (err) {
    if (err) {
      console.log('Updating Mailer Failed!');
      console.log(err);
      return;
    };
    app.mailer.send('email', {
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
  })

});

// Error Handler
app.use(express.errorHandler());

/**
 * Module exports.
 */

if (!module.parent) {
  server.listen(8000);
  console.log('Express app started on port 8000');
};