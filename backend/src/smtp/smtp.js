import config from './config';
import logger from '../config/winston';
import nodemailer from 'nodemailer';
import expressTemplates from 'nodemailer-express-handlebars';
import path from 'path';

let mailErrorsCount = 0;
let mailSuccessCount = 0;

const templatePlugin = expressTemplates({
    viewEngine: { partialsDir: path.resolve(__dirname, './templates'), defaultLayout: false },
    viewPath: path.resolve(__dirname, './templates'),
    extName: '.hbs',
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

    transport.sendMail(message, (error) => {
        if (error) {
            logger.info(`Mail error count: ${++mailErrorsCount}`);
            logger.error(JSON.stringify(error));
        } else {
            logger.info(`Mail success count: ${++mailSuccessCount}`);
        }
    });
}

export { sendMail };
