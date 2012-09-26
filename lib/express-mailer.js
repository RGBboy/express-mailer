/*!
 * express-mailer
 * Copyright(c) 2012 RGBboy <me@rgbboy.com>
 * MIT Licensed
 */

/**
 * Module Dependencies
 */

var nodemailer = require('nodemailer');

/**
 * Return a middleware function
 *
 * @param {Object} options
 * @return {Function} middleware function
 * @api public
 */
exports = module.exports = function (options) {

  var from = options.from, // sender address
      app;

  // create reusable transport method (opens pool of SMTP connections)
  var smtpTransport = nodemailer.createTransport('SMTP', options);

  var sendEmail = function (template, locals, callback) {

    app.render(template, locals, function(err, html) {

      if (err) {
        callback(err);
        return;
      }

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

  var middleware = function (req, res, next) {
    app = req.app;
    res.sendEmail = sendEmail;
    next();
  };

  return middleware;

};

/**
* Library version.
*/

exports.version = '0.0.1';