/*!
 * express-mailer unit tests
 */

/**
 * Module Dependencies
 */

var Mailer = require('../lib/express-mailer'),
    rewire = require('rewire'),
    should = require('should'),
    sinon = require('sinon');

/**
 * Tests
 */

describe('Mailer', function () {

  var fakes,
      fakeReq,
      fakeRes,
      fakeNodemailer,
      fakeSMTPTransport,
      mailerOptions = {
        from: 'TestApplication@localhost',
        host: 'localhost', // hostname
        secureConnection: true, // use SSL
        port: 8465, // port for secure SMTP
        auth: {
          user: 'TestApplication',
          pass: 'TestApplication'
        }
      },
      fakeHTML = '<html><head><title>Test Email</title></head><body><h1>Title</h1><p>Lorem ipsum.</p></body></html>';

  describe('({options})', function () {

    var middleware;

    beforeEach(function (done) {
      fakes = sinon.sandbox.create();

      fakeReq = fakes.stub();
      fakeReq.app = fakes.stub();
      fakeReq.app.render = fakes.stub();
      fakeReq.app.render.callsArgWith(2, null, fakeHTML);

      fakeRes = fakes.stub();

      fakeSMTPTransport = fakes.stub();
      fakeSMTPTransport.sendMail = fakes.stub();
      fakeSMTPTransport.sendMail.callsArg(1);

      fakeNodemailer = fakes.stub();
      fakeNodemailer.createTransport = fakes.stub().returns(fakeSMTPTransport);
      Mailer = rewire('../lib/express-mailer');
      Mailer.__set__('nodemailer', fakeNodemailer);

      middleware = Mailer(mailerOptions);
      done();
    });

    afterEach(function (done) {
      fakes.restore();
      Mailer = require('../lib/express-mailer');
      done();
    });

    it('should return a middleware function', function (done) {
      middleware.should.be.a('function');
      done();
    });

    it('should create an SMTP Transport Object with \'SMTP\' and the options', function (done) {
      fakeNodemailer.createTransport.called.should.be.true;
      fakeNodemailer.createTransport.calledWith('SMTP', mailerOptions).should.be.true;
      done();
    });

    describe('middleware', function () {

      beforeEach(function (done) {
        middleware(fakeReq, fakeRes, done);
      });

      it('should attach a .sendEmail function to the response object', function (done) {
        fakeRes.sendEmail.should.be.a('function');
        done();
      });

    });

    describe('response.sendEmail', function () {

      var sendEmail,
          sendOptions = {
            to: 'TestUser@localhost',
            subject: 'Test Subject',
            testProperty: 'testProperty'
          };

      beforeEach(function (done) {
        middleware(fakeReq, fakeRes, function() {
          sendEmail = fakeRes.sendEmail;
          done();
        });
      });

      it('should callback', function (done) {
        sendEmail('template', sendOptions, done);
      });

      it('should call application.render with template and options', function (done) {
        sendEmail('template', sendOptions, function (err) {
          fakeReq.app.render.calledOnce.should.be.true;
          fakeReq.app.render.calledWith('template', sendOptions);
          done(err);
        });
      });

      it('should callback with error if application.render fails', function (done) {
        fakeReq.app.render.callsArgWith(2, new Error());
        sendEmail('template', sendOptions, function (err) {
          err.should.exist;
          fakeSMTPTransport.sendMail.called.should.be.false;
          done();
        });
      });

      it('should call smtpTransport.sendMail with correct options', function (done) {
        sendEmail('template', sendOptions, function (err) {
          fakeSMTPTransport.sendMail.calledOnce.should.be.true;
          var args = fakeSMTPTransport.sendMail.args[0][0];
          args.from.should.equal(mailerOptions.from)
          args.to.should.equal(sendOptions.to)
          args.subject.should.equal(sendOptions.subject)
          args.generateTextFromHTML.should.be.true;
          args.html.should.equal(fakeHTML);
          done(err);
        });
      });

      it('should callback with error if smtpTransport.sendMail fails', function (done) {
        fakeSMTPTransport.sendMail.callsArgWith(1, new Error());
        sendEmail('template', sendOptions, function (err) {
          err.should.exist;
          done();
        });
      });

    });

  });

});