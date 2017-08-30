/*!
 * express-mailer example
 */

/**
 * Module Dependencies
 */
var testing = false;

if( testing )
  process.env.NODE_ENV = 'test';
if( process.env.NODE_ENV == 'test' )
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

var express = require('express'),
    app = express(),
    server = module.exports = require('http').createServer(app),
    mailer = require('../index'),
    config = require('./config'),
    morgan = require( 'morgan' );
    currentMailerOptions = config.mailer,
    bodyParser = require( 'body-parser' );

mailer.extend(app, currentMailerOptions);
app.locals.testVariable = 'Test Variable';
app.locals.testFunction = function () {
  return 'Test Function';
};

// Views
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// Configuration

app.use( morgan( 'dev' ) );
app.use( bodyParser.urlencoded( { extended: false , limit : '10mb' } ) );
app.use( bodyParser.json() );
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
      console.log(err , email);
      res.redirect('back');
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
  if( req.body[ 'user[email]'] ) {
    req.body.user = {
      email : req.body[ 'user[email]']
    };
    delete req.body[ 'user[email]'];
  }
  if( !req.body.user ) {
    console.log( 'No body sent' , req.body , req.query );
    res.redirect('back');
    return;
  }
  if(!req.body.user.email) {
    console.log( 'Information missing' , req.body );
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
      res.redirect('back');
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
  if( req.body[ 'user[email]'] ) {
    req.body.user = {
      email : req.body[ 'user[email]']
    };
    delete req.body[ 'user[email]'];
  }
  if( !req.body.user ) {
    console.log( 'No body sent' , req.body , req.query );
    res.redirect('back');
    return;
  }
  if(!req.body.user.email) {
    console.log( 'Information missing' , req.body );
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
      res.redirect('back');
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

  if( req.body[ 'user[email]'] ) {
    req.body.user = {
      email : req.body[ 'user[email]']
    };
    delete req.body[ 'user[email]'];
  }
  if( !req.body.user ) {
    console.log( 'No body sent' , req.body , req.query );
    res.redirect('back');
    return;
  }
  if(!req.body.user.email) {
    console.log( 'Information missing' , req.body );
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
        res.redirect('back');
        return;
      };
      res.redirect('/');
    });
  })

});

// Error Handler
// app.use(express.errorHandler());

app.all( '*' , handleError );

function handleError( err , req , res , next ) {
  console.log( 'ERROR HANLDER HAS BEEN CALLED...' );
  console.log( err );
  console.error( err.stack );
  res.send( 500 , err.message );
    return;
}

/**
 * Module exports.
 */

var port = 8000;
if (!module.parent) {
  server.listen(port);
  console.log('Express app started on port 8000');
};

if( testing ) {
  var Mailbox = require('test-mailbox'),
  user,
  baseURL,
  fakeEmail,
  mailbox;
  baseURL = 'http://localhost:' + port;
  fakeEmail = 'test@localhost';
  mailbox = new Mailbox({
    address: fakeEmail,
    auth: config.mailer.auth,
    timeout: 500
  });

  mailbox.listen(config.mailer.port, function( err ) {
    if( err )
      console.log( err)
  });

  mailbox.on('newMail', console.log);
}
