/*!
 * express-mailer
 * Copyright(c) 2013 RGBboy <me@rgbboy.com>
 * MIT Licensed
 */

/**
 * Module Dependencies
 */

var nodemailer = require('nodemailer');

/**
* Library version.
*/

exports.version = '0.2.3';

/**
 * Add email functionality to express application.
 *
 * @param {Application} app
 * @param {Object} options
 * @return {Application} app
 * @api public
 */
exports.extend = function (app, options) {

  if (app.mailer) {
    throw new Error('Application already has been extended with Express-Mailer!');
  };

  var mailer = {},
      from = options.from, // sender address
      transportMethod = options.transportMethod || 'SMTP',
      smtpTransport = nodemailer.createTransport(transportMethod, options),
      stubTransport,
      sendMail,
      createRender,
      createSend;

  /**
   * .sendMail
   *
   * Renders an enitre email using the given template and locals;
   *
   * @param {String|Object} template|sendOptions
   * @param {Object} locals (template local variables)
   * @param {Object} transport (nodemailer transport)
   * @param {Function} render (app.render or res.render)
   * @param {Function} callback
   * @api private
   */
  sendMail = function (sendOptions, locals, transport, render, callback) {
    var template;
    if (typeof sendOptions === "string") {
      template = sendOptions;
      sendOptions = {};
    } else {
      template = sendOptions.template;
    };

    render(template, locals, function (err, html) {
      if (err) {
         callback(err);
         return;
       };

       sendOptions.from = sendOptions.from || from;
       sendOptions.to = sendOptions.to || locals.to;
       sendOptions.subject = sendOptions.subject || locals.subject;
       sendOptions.generateTextFromHTML = true;
       sendOptions.html = html;

       transport.sendMail(sendOptions, function (err, res) {
         if (err) {
           callback(err);
           return;
         } else {
           callback(null, res.message);
         };
       });
    });
  };

  createRender = function (render) {
    return function (sendOptions, locals, callback) {
      if (!stubTransport) {
        stubTransport = nodemailer.createTransport('Stub', options);
      };
      sendMail(sendOptions, locals, stubTransport, render, callback);
    };
  };

  createSend = function (render) {
    return function (sendOptions, locals, callback) {
      sendMail(sendOptions, locals, smtpTransport, render, callback);
    };
  };

  /**
   * .render
   *
   * Renders an enitre email using the given template and locals;
   *
   * @param {String|Object} template|sendOptions
   * @param {Object} locals (template local variables)
   * @param {Function} callback
   * @api public
   */
   mailer.render = createRender(app.render.bind(app));

  /**
   * .send
   *
   * Sends an email using the given template and locals;
   *
   * @param {String|Object} template|sendOptions
   * @param {Object} locals (template local variables)
   * @param {Function} callback
   * @api public
   */
  mailer.send = createSend(app.render.bind(app));

  /**
   * .update
   *
   * Updates the settings for mailer and callsback when ready;
   *
   * @param {Object} options
   * @param {Function} callback
   * @api public
   */
  mailer.update = function (options, callback) {
    smtpTransport.close(function (err) {
      if (err) {
        callback(err);
        return;
      };
      from = options.from;
      transportMethod = options.transportMethod || 'SMTP';
      smtpTransport = nodemailer.createTransport(transportMethod, options);
      callback(null);
    });
  };

  // Add .mailer to res object
  app.use(function (req, res, next) {
    res.mailer = {
      render: createRender(res.render.bind(res)),
      send: createSend(res.render.bind(res)),
      update: mailer.update
    };
    next();
  });

  app.mailer = mailer;

  return app;

};
