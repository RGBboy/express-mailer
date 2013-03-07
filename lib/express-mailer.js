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

exports.version = '0.2.0';

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
      stubTransport;

  /**
   * Renders an enitre email using the given template and locals;
   *
   * @param {String} template (the name of the template)
   * @param {Object} locals (template local variables)
   * @param {Function} callback
   * @api public
   */
   mailer.render = function (template, locals, callback) {

     if (!stubTransport) {
       stubTransport = nodemailer.createTransport('Stub', options);
     };

     self.render(template, locals, function(err, html) {

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

       stubTransport.sendMail(mailOptions, function (err, res) {
         if (err) {
           callback(err);
           return;
         } else {
           callback(null, res.message);
         };
       });

     });

   };

  /**
   * Sends an email using the given template and locals;
   *
   * @param {String} template (the name of the template)
   * @param {Object} locals (template local variables)
   * @param {Function} callback
   * @api public
   */
  mailer.send = function (template, locals, callback) {

    self.render(template, locals, function (err, html) {

      if (err) {
        callback(err);
        return;
      };

      var mailOptions = {
        from: from,
        to: locals.to,
        subject: locals.subject,
        generateTextFromHTML: true, // let nodemailer generate plain text from html
        html: html
      };

      // send mail with defined transport object
      smtpTransport.sendMail(mailOptions, function (err, res) {
        if (err) {
          callback(err);
          return;
        } else {
          callback(null);
        };
      });

    });
  };

  /**
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

  // Add .sendEmail to res object
  self.use(function (req, res, next) {
    res.mailer = mailer;
    next();
  });

  self.mailer = mailer;

  return self;

};
