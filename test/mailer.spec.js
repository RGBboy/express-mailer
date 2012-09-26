/*!
 * express-mailer spec
 */

/**
 * Module Dependencies
 */

var app = require('../example/app'),
    should = require('should'),
    request = require('superagent'),
    Mailbox = require('test-mailbox'),
    config = require('../example/config');

/**
 * Tests
 */

describe('Mailer', function () {

  var user,
      baseURL,
      server,
      fakeEmail,
      mailbox;

  before(function (done) {
    // Start up my app
    var port = 8000;
    server = app.listen(port);
    baseURL = 'http://localhost:' + port;
    fakeEmail = 'test@test.com';
    mailbox = new Mailbox({
      address: fakeEmail,
      auth: config.mailer.auth
    });

    mailbox.listen(config.mailer.port, done);

  });

  after(function (done) {
    //close mailbox and app
    mailbox.close(function() {
      server.close(function() {
        done();
      });
    });
  })

  describe('POST /send-mail', function () {

    it('should send mail to me', function (done) {

      mailbox.once('newMail', function (mail) {
        mail.html.should.include('<title>Test Email</title>');
        done();
      });

      request
        .post(baseURL + '/send-mail')
        .send({ 
          user: {
            email: fakeEmail
          }
        })
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
        });
    });

  });

});