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
      fakeEmail,
      mailbox;

  before(function (done) {
    // Start up my app
    var port = 8000;
    app.listen(port);
    // app.setTimeout does not exist in node 0.8
    if (app.setTimeout) {
      // Set server timeout so connections close;
      app.setTimeout(500);
    };
    baseURL = 'http://localhost:' + port;
    fakeEmail = 'test@test.com';
    mailbox = new Mailbox({
      address: fakeEmail,
      auth: config.mailer.auth,
      timeout: 500
    });

    mailbox.listen(config.mailer.port, done);

  });

  after(function (done) {
    //close mailbox and app
    mailbox.close(function() {
      app.close(function() {
        done();
      });
    });
  })

  describe('GET /render-mail', function () {

    it('should render the email', function (done) {

      request
        .get(baseURL + '/render-mail')
        .end(function (err, res) {
          if (err) {
            return done(err);
          };
          res.text.should.include('Subject: Test Email');
          done();
        });
    });

  });

  describe('POST /send-mail-via-app', function () {

    it('should send mail to me', function (done) {

      mailbox.once('newMail', function (mail) {
        mail.html.should.include('<title>Test Email</title>');
        done();
      });

      request
        .post(baseURL + '/send-mail-via-app')
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

  describe('POST /send-mail-via-res', function () {

    it('should send mail to me', function (done) {

      mailbox.once('newMail', function (mail) {
        mail.html.should.include('<title>Test Email</title>');
        done();
      });

      request
        .post(baseURL + '/send-mail-via-res')
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

  describe('POST /send-mail-with-update', function () {

    it('should send mail to me with updated settings', function (done) {

      mailbox.once('newMail', function (mail) {
        mail.from[0].address.should.equal(config.mailerUpdate.from);
        mail.from[0].address.should.not.equal(config.mailer.from);
        mail.html.should.include('<title>Test Email</title>');
        done();
      });

      request
        .post(baseURL + '/send-mail-with-update')
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