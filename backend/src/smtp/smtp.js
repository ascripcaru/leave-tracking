import config from './config';
import nodemailer from 'nodemailer';
import expressTemplates from 'nodemailer-express-handlebars';
import path from 'path';

const templatePlugin = expressTemplates({
    viewEngine: { partialsDir: path.resolve(__dirname, './templates') },
    viewPath: path.resolve(__dirname, './templates'),
    extName: '.hbs'
});

const transport = nodemailer.createTransport(config).use('compile', templatePlugin);

function sendMail(to, subject, template, context) {
    const message = {
        from: config.senderEmail,
        to,
        subject,
        template,
        context,
    };

    return transport.sendMail(message);
}

export { sendMail }
