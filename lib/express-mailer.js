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

exports.version = '0.2.1';

/**
 * Add email functionality to express application.
 *
 * @param {Application} self
 * @param {Object} options
 * @return {Application} self
 * @api public
 */
exports.extend = function (self, options) {

  if (self.mailer) {
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
   * @param {String} template (the name of the template)
   * @param {Object} locals (template local variables)
   * @param {Object} transport (nodemailer transport)
   * @param {Function} render (app.render or res.render)
   * @param {Function} callback
   * @api private
   */
  sendMail = function (template, locals, transport, render, callback) {
    render(template, locals, function (err, html) {
      if (err) {
         callback(err);
         return;
       };

       var mailOptions = {
         from: from,
         to: locals.to,
         subject: locals.subject,
         generateTextFromHTML: true,
         html: html
       };

       transport.sendMail(mailOptions, function (err, res) {
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
    return function (template, locals, callback) {
      if (!stubTransport) {
        stubTransport = nodemailer.createTransport('Stub', options);
      };
      sendMail(template, locals, stubTransport, render, callback);
    };
  };

  createSend = function (render) {
    return function (template, locals, callback) {
      sendMail(template, locals, smtpTransport, render, callback);
    };
  };

  /**
   * .render
   *
   * Renders an enitre email using the given template and locals;
   *
   * @param {String} template (the name of the template)
   * @param {Object} locals (template local variables)
   * @param {Function} callback
   * @api public
   */
   mailer.render = createRender(self.render.bind(self));

  /**
   * .send
   *
   * Sends an email using the given template and locals;
   *
   * @param {String} template (the name of the template)
   * @param {Object} locals (template local variables)
   * @param {Function} callback
   * @api public
   */
  mailer.send = createSend(self.render.bind(self));

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
  self.use(function (req, res, next) {
    res.mailer = {
      render: createRender(res.render.bind(res)),
      send: createSend(res.render.bind(res)),
      update: mailer.update
    };
    next();
  });

  self.mailer = mailer;

  return self;

};
