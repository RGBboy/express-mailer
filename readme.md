# express-mailer

Send Emails from your application and response object.

[![Build Status](https://secure.travis-ci.org/RGBboy/express-mailer.png)](http://travis-ci.org/RGBboy/express-mailer)

## Note

If you have updated express-mailer from Version 0.1.2 or earlier there 
have been major API changes. The `app.sendEmail` method no longer gets 
attached to the application. Instead a mailer object is attached. The 
`app.sendEmail` functionality can now be accessed via `app.mailer.send`.

## Installation

Works with Express 3.x.x

    $ npm install express-mailer

## Usage

Express Mailer extends your express application

```javascript
// project/app.js

var app = require('express')(),
    mailer = require('express-mailer');

mailer.extend(app, {
  from: 'no-reply@example.com',
  host: 'smtp.gmail.com', // hostname
  secureConnection: true, // use SSL
  port: 465, // port for secure SMTP
  transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
  auth: {
    user: 'gmail.user@gmail.com',
    pass: 'userpass'
  }
});

```

## Views

Mailer views use the same render process as Express. You can use any view 
engine that Express supports. Setting up views for mailer is exactly the same 
as setting up views for Express. For example, to set the view directory to 
`project/views` and view engine to `jade` you would write:

```javascript
// project/app.js

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
```

Then we can write our templates in Jade:

```javascript
// project/views/email.jade

!!! transitional
html
  head
    meta(http-equiv = 'Content-Type', content = 'text/html; charset=UTF-8')
    title= subject
    body
      h1.h1 Lorem ipsum
      p
        strong Lorem ipsum dolor: 
        | Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        br
        |Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      h2.h2 Lorem ipsum
      p Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      p Lorem ipsum:
      ol
        li Lorem ipsum dolor
        li Lorem ipsum dolor
        li Lorem ipsum dolor
```

## Sending an email

You can send an email by calling `app.mailer.send(template, locals, callback)`.
To send an email using the template above you could write:

```javascript
app.get('/', function (req, res, next) {
  app.mailer.send('email', {
    to: 'example@example.com', // REQUIRED. This can be a comma delimited string just like a normal email to field. 
    subject: 'Test Email', // REQUIRED.
    otherProperty: 'Other Property' // All additional properties are also passed to the template as local variables.
  }, function (err) {
    if (err) {
      // handle error
      console.log(err);
      res.send('There was an error sending the email');
      return;
    }
    res.send('Email Sent');
  });
});
```

You can also send an email by calling mailer on an applications response 
object: `res.mailer.send(template, options, callback)`.

## Nodemailer options

It is also possible to change the options supplied to nodemailers `sendMail` 
function. Instead of passing in the template name to `mailer.send` or 
`mailer.render` you can pass an object with any of the following fields:

  * **template** - REQUIRED - The name of the template to render 
  * **from** - The e-mail address of the sender. All e-mail addresses can be plain `sender@server.com` or formatted `Sender Name <sender@server.com>`
  * **to** - Comma separated list or an array of recipients e-mail addresses that will appear on the `To:` field
  * **cc** - Comma separated list or an array of recipients e-mail addresses that will appear on the `Cc:` field
  * **bcc** - Comma separated list or an array of recipients e-mail addresses that will appear on the `Bcc:` field
  * **replyTo** - An e-mail address that will appear on the `Reply-To:` field
  * **inReplyTo** - The message-id this message is replying
  * **references** - Message-id list
  * **subject** - The subject of the e-mail
  * **headers** - An object of additional header fields `{"X-Key-Name": "key value"}` (NB! values are passed as is, you should do your own encoding to 7bit and folding if needed)
  * **attachments** - An array of attachment objects.
  * **alternatives** - An array of alternative text contents (in addition to text and html parts)
  * **envelope** - optional SMTP envelope, if auto generated envelope is not suitable
  * **messageId** - optional Message-Id value, random value will be generated if not set. Set to false to omit the Message-Id header
  * **date** - optional Date value, current UTC string will be used if not set
  * **encoding** - optional transfer encoding for the textual parts (defaults to "quoted-printable")
  * **charset** - optional output character set for the textual parts (defaults to "utf-8")
  * **dsn** - An object with methods `success`, `failure` and `delay`. If any of these are set to true, DSN will be used

For example you could cc others with the previous example like this:

```javascript
app.mailer.send(
  {
    template: 'email', // REQUIRED
    cc: 'cc@example.com'
  },
  {
    to: 'example@example.com',
    subject: 'Test Email',
    otherProperty: 'Other Property'
  },
  function (err) {
    if (err) {
      // handle error
    };
      // mail sent!
  }
);
```

## Updating the configuration

You can update your original configuration by calling `app.mailer.update(updatedOptions, callback)`.
This can be processor intensive so changes to your configuration are best kept to a minimum.

## Rendering an email without sending

You can render an email without sending it by calling `app.mailer.render(template, locals, callback)`.
This can be used to check what an email will look like without sending it:

```javascript
app.get('/', function (req, res, next) {
  res.mailer.render('email', {
    to: 'example@example.com',
    subject: 'Test Email',
    otherProperty: 'Other Property'
  }, function (err, message) {
    if (err) {
      // handle error
      console.log(err);
      res.send('There was an error rendering the email');
      return;
    }
    res.header('Content-Type', 'text/plain');
    res.send(message);
  });
});
```

## Notes

Mailchimp has a bunch of templates that may be a good starting point.
Check them out at https://github.com/mailchimp/Email-Blueprints

## To Do

* Add ability to curry the from address.
* Add checking of options when .mailer.send is called.

## License 

(The MIT License)

Copyright (c) 2014 RGBboy &lt;l-_-l@rgbboy.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
