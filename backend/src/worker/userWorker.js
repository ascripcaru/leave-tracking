import moment from 'moment';
import logger from '../config/winston';
import { sendMail } from '../smtp/smtp';

async function handleEmploymentAnniversary(params) {
    try {
        const toEmail = process.env.APPROVED_LEAVE_CC_EMAIL;
        const { startDate } = params;
        const emailSubject = 'Employment Anniversary';

        params.years = moment().year() - moment(startDate).year();
        params.startDate = moment(startDate).format('DD MMMM');

        await sendMail(toEmail, emailSubject, 'employmentAnniversary', params);
    } catch (error) {
        logger.error(error);
    }
}

async function handleNewUser(params) {
    try {
        const { email, firstName } = params;
        const emailSubject = `${firstName}, your account has been created`;
        const domain = process.env.FE_DOMAIN || 'http://localhost:3000';

        params.domain = domain;

        await sendMail(email, emailSubject, 'newUser', params);
    } catch (error) {
        logger.error(error);
    }
}

async function handlePasswordReset(params) {
    try {
        const { email, firstName } = params.user;
        const fe_domain = process.env.FE_DOMAIN || 'http://localhost:3000';

        params.domain = fe_domain;

        const emailSubject = `${firstName} password reset`;

        await sendMail(email, emailSubject, 'resetPassword', params);
    } catch (error) {
        logger.error(error);
    }
}

export { handleNewUser, handlePasswordReset, handleEmploymentAnniversary };
