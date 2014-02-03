/*!
 * express-mailer unit tests
 */

/**
 * Module Dependencies
 */

var mailer = require('../lib/express-mailer'),
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
      fakeMessage = 'fake message',
      fakeHTML = '<html><head><title>Test Email</title></head><body><h1>Title</h1><p>Lorem ipsum.</p></body></html>';

  describe('.version', function () {

    it('should match the format x.x.x', function (done) {
      mailer.version.should.match(/^\d+\.\d+\.\d+$/);
      done();
    });

  });

  describe('.extend', function () {

    var app;

    beforeEach(function (done) {
      fakes = sinon.sandbox.create();

      fakeReq = fakes.stub();
      fakeRes = fakes.stub();
      fakeRes.render = fakes.stub();
      fakeRes.render.callsArgWith(2, null, fakeHTML);

      app = fakes.stub();
      app.render = fakes.stub();
      app.render.callsArgWith(2, null, fakeHTML);
      app.use = fakes.stub();

      fakeSMTPTransport = fakes.stub();
      fakeSMTPTransport.sendMail = fakes.stub();
      fakeSMTPTransport.sendMail.callsArgWith(1, null, {
        message: fakeMessage
      });
      fakeSMTPTransport.close = fakes.stub();
      fakeSMTPTransport.close.callsArg(0);

      fakeNodemailer = fakes.stub();
      fakeNodemailer.createTransport = fakes.stub().returns(fakeSMTPTransport);
      mailer = rewire('../lib/express-mailer');
      mailer.__set__('nodemailer', fakeNodemailer);

      done();
    });

    afterEach(function (done) {
      fakes.restore();
      mailer = require('../lib/express-mailer');
      done();
    });

    it('should be a function', function (done) {
      mailer.extend.should.be.a('function');
      done();
    });

    it('should attach a .sendEmail function to the application', function (done) {
      mailer.extend(app, mailerOptions);
      app.mailer.should.be.a('object');
      done();
    });

    it('should throw if the application has already been extended', function (done) {
      mailer.extend(app, mailerOptions);
      (function () {
        mailer.extend(app, mailerOptions)
      }).should.throw();
      done();
    });

    it('should return the application', function (done) {
      var returnValue = mailer.extend(app, mailerOptions);
      returnValue.should.equal(app);
      done();
    });

    describe('app.mailer', function () {

      beforeEach(function (done) {
        mailer.extend(app, mailerOptions);
        done();
      });

      it('should be an object', function (done) {
        app.mailer.should.be.a('object');
        done();
      });

      describe('.send', function () {

        var sendOptions = {
              to: 'TestUser@localhost',
              subject: 'Test Subject',
              testProperty: 'testProperty'
            };

        it('should be a function', function (done) {
          app.mailer.send.should.be.a('function');
          done();
        });

        it('should callback', function (done) {
          app.mailer.send('template', sendOptions, done);
        });

        it('should call application.render with template and options', function (done) {
          app.mailer.send('template', sendOptions, function (err) {
            app.render.calledOnce.should.be.true;
            app.render.calledWith('template', sendOptions);
            done(err);
          });
        });

        it('should callback with error if application.render fails', function (done) {
          app.render.callsArgWith(2, new Error());
          app.mailer.send('template', sendOptions, function (err) {
            err.should.exist;
            fakeSMTPTransport.sendMail.called.should.be.false;
            done();
          });
        });

        it('should call smtpTransport.sendMail with correct options', function (done) {
          app.mailer.send('template', sendOptions, function (err) {
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
          app.mailer.send('template', sendOptions, function (err) {
            err.should.exist;
            done();
          });
        });

      });

      describe('.update', function () {

        var newOptions = {
              from: 'NewTestApplication@localhost',
              host: mailerOptions.host,
              secureConnection: mailerOptions.secureConnection,
              port: mailerOptions.port,
              auth: {
                user: mailerOptions.auth.user,
                pass: mailerOptions.auth.pass
              }
            };

        it('should be a function', function (done) {
          app.mailer.update.should.be.a('function');
          done();
        });

        it('should callback', function (done) {
          app.mailer.update(newOptions, done);
        });

        it('should close the current transport', function (done) {
          app.mailer.update(newOptions, function (err) {
            should.not.exist(err);
            fakeSMTPTransport.close.calledOnce.should.be.true;
            done();
          });
        });

        it('should create a new transport after closing', function (done) {
          app.mailer.update(newOptions, function (err) {
            should.not.exist(err);
            fakeSMTPTransport.close.calledOnce.should.be.true;
            fakeNodemailer.createTransport.callCount.should.equal(2); // once for original, once for update;
            fakeNodemailer.createTransport.calledAfter(fakeSMTPTransport.close).should.be.true;
            done();
          });
        });

      });

      describe('.render', function () {

        var renderOptions = {
              to: 'TestUser@localhost',
              subject: 'Test Subject',
              testProperty: 'testProperty'
            };

        it('should be a function', function (done) {
          app.mailer.render.should.be.a('function');
          done();
        });

        it('should callback with the message', function (done) {
          app.mailer.render('template', renderOptions, function (err, message) {
            message.should.equal(fakeMessage);
            done();
          });
        });

      });

    });

    describe('middleware res.mailer', function () {

      var middleware,
          sendOptions = {
            to: 'TestUser@localhost',
            subject: 'Test Subject',
            testProperty: 'testProperty'
          };

      beforeEach(function (done) {
        mailer.extend(app, mailerOptions);
        middleware = app.use.args[0][0];
        middleware(fakeReq, fakeRes, done);
      });

      it('should call app.use once', function (done) {
        app.use.calledOnce.should.be.true;
        done();
      });

      // This should fail
      it('should equal app.mailer', function (done) {
        fakeRes.mailer.should.equal(app.mailer);
        done();
      });

      describe('res.mailer.send', function () {

        it('should call res.render with template and options', function (done) {
          fakeRes.mailer.send('template', sendOptions, function (err) {
            fakeRes.render.calledOnce.should.be.true;
            fakeRes.render.calledWith('template', sendOptions);
            done(err);
          });
        });

      });

      describe('res.mailer.render', function () {

        it('should call res.render with template and options', function (done) {
          fakeRes.mailer.render('template', sendOptions, function (err) {
            fakeRes.render.calledOnce.should.be.true;
            fakeRes.render.calledWith('template', sendOptions);
            done(err);
          });
        });

      });

    });

  });

});