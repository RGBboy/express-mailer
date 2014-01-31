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
      mailTransport = nodemailer.createTransport(transportMethod, options),
      stubTransport;


  // Called by mailer.send and mailer.render
  function internalSend(template, locals, transport, render, callback) {

    render(template, locals, function (err, html) {

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
      transport.sendMail(mailOptions, function (err, res) {
        if (err) {
          callback(err);
          return;
        } else {
          callback(null);
          return;
        };
      });

    });

  };

  // Called by mailer.render
  function createStubTransport() {
    if (!stubTransport) {
      stubTransport = nodemailer.createTransport('Stub', options);
    };
    return stubTransport;
  }


  // Add .mailer to res object
  app.use(function (req, res, next) {
    res.mailer = {
      render: function (template, locals, callback) {
        internalSend(template, locals, createStubTransport(), res.render.bind(res), callback)
      },
      send: function (template, locals, callback) {
        internalSend(template, locals, mailTransport, res.render.bind(res), callback)
      }
    };
    next();
  });

  app.mailer = {

    /**
     * Renders an enitre email using the given template and locals;
     *
     * @param {String} template (the name of the template)
     * @param {Object} locals (template local variables)
     * @param {Function} callback
     * @api public
     */
     render: function (template, locals, callback) {
       internalSend(template, locals, createStubTransport(), app.render.bind(app), callback)
     },

    /**
     * Sends an email using the given template and locals;
     *
     * @param {String} template (the name of the template)
     * @param {Object} locals (template local variables)
     * @param {Function} callback
     * @api public
     */
    send: function (template, locals, callback) {
      internalSend(template, locals, mailTransport, app.render.bind(app), callback)
    },

    /**
     * Updates the settings for mailer and callsback when ready;
     *
     * @param {Object} options
     * @param {Function} callback
     * @api public
     */
    update: function (options, callback) {
      mailTransport.close(function (err) {
        if (err) {
          callback(err);
          return;
        };
        from = options.from;
        transportMethod = options.transportMethod || 'SMTP';
        mailTransport = nodemailer.createTransport(transportMethod, options);
        callback(null);
      });
    }

  };

  return app;

};
