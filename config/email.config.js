var mailer = require('nodemailer');

module.exports.GmailTransport = mailer.createTransport({
    service: process.env.MAILER_SERVICE_PROVIDER,
    auth: {
        user: process.env.MAILER_EMAIL_ID,
        pass: process.env.MAILER_PASSWORD
    }
});


// module.exports = transporter;
module.exports.ViewOption = (transport, template, hbs) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(transport.use('compile', hbs({
                viewEngine: {
                    extName: '.hbs',
                    partialsDir: 'app/views/email',
                    layoutsDir: 'app/views/email',
                    defaultLayout: template + '.hbs',
                },
                viewPath: 'app/views/email',
                extName: '.hbs'
            })))
        });
    })

}
module.exports.ClearOption = (transport, template, hbs) => {
    console.log('template is --', template)
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(transport.use('compile', hbs({
                viewEngine: {
                    extName: '.hbs',
                    partialsDir: 'app/views/email',
                    layoutsDir: 'app/views/email',
                    defaultLayout: template + '.hbs',
                },
                viewPath: 'app/views/email',
                extName: '.hbs'
            })))
        });
    })

}
