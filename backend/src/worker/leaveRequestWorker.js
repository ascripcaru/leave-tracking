import _ from 'lodash';
import moment from 'moment';
import logger from '../config/winston';
import { sendMail } from '../smtp/smtp';
import User from '../server/models/user.model';
import Project from '../server/models/project.model';
import { DATE_FORMAT, DATETIME_FORMAT } from '../server/helpers/constants';
import { sendNotificationForEmails } from '../push.service';

async function handleNewLeaveRequest(leave) {
    try {
        const { leaveType } = leave;
        const { user, projects, approversData, approversEmails } = await getAndAgredateLeaveRequestData(leave);
        const { email, firstName, lastName } = user;

        leave.domain = process.env.FE_DOMAIN || 'http://localhost:3000';
        leave.projectName = projects.map(p => p.name).reduce((a, v) => `${a}, ${v}`);
        leave.approvers = approversData;
        leave.employee = user;
        leave.start = moment(leave.start).format(DATE_FORMAT);
        leave.end = moment(leave.end).format(DATE_FORMAT);
        leave.createdAt = moment(leave.createdAt).format(DATETIME_FORMAT);

        const userEmailSubject = `[${leaveType}] Hi ${firstName}, here is your leave request`;
        const approverEmailSubject = `[${leaveType}] Leave request pending for: ${firstName} ${lastName}`;

        sendMail(email, userEmailSubject, 'newUserLeaveRequest', leave);
        sendMail(approversEmails.join(','), approverEmailSubject, 'newApproverLeaveRequest', leave);
        sendNotificationForEmails(approversEmails, { title: 'Leave request pending for:', body: `${firstName} ${lastName}` });
    } catch (error) {
        logger.error(error);
    }
}

async function handleLeaveReminder(leave) {
    try {
        const { leaveType } = leave;
        const { user, projects, approversData, approversEmails } = await getAndAgredateLeaveRequestData(leave);
        const { firstName, lastName } = user;

        leave.domain = process.env.FE_DOMAIN || 'http://localhost:3000';
        leave.projectName = projects.map(p => p.name).reduce((a, v) => `${a}, ${v}`);
        leave.approvers = approversData;
        leave.employee = user;
        leave.start = moment(leave.start).format(DATE_FORMAT);
        leave.end = moment(leave.end).format(DATE_FORMAT);
        leave.createdAt = moment(leave.createdAt).format(DATETIME_FORMAT);

        const approverEmailSubject = `[${leaveType}] REMINDER Leave request pending for: ${firstName} ${lastName}`;

        sendMail(approversEmails.join(','), approverEmailSubject, 'newApproverLeaveRequest', leave);
    } catch (error) {
        logger.error(error);
    }
}

async function handleApprovedLeaveRequest(leave) {
    try {
        const { leaveType } = leave;
        const { user, projects, approver, approversData, approversEmails } = await getAndAgredateLeaveRequestData(leave);
        const { email, firstName, lastName } = user;

        leave.projectName = projects.map(p => p.name).reduce((a, v) => `${a}, ${v}`);
        leave.approvers = approversData;
        leave.employee = user;
        leave.approver = approver;
        leave.start = moment(leave.start).format(DATE_FORMAT);
        leave.end = moment(leave.end).format(DATE_FORMAT);
        leave.createdAt = moment(leave.createdAt).format(DATETIME_FORMAT);

        const approvedCopyEmailAddress = process.env.APPROVED_LEAVE_CC_EMAIL;
        const userEmailSubject = `[${leaveType}] Hi ${firstName}, your leave request has been APPROVED`;
        const approverEmailSubject = `[${leaveType}] APPROVED Leave request for: ${firstName} ${lastName}`;

        sendMail(`${email},${approvedCopyEmailAddress}`, userEmailSubject, 'approvedLeaveRequest', leave);
        sendMail(approversEmails.join(','), approverEmailSubject, 'approvedLeaveRequest', leave);
    } catch (error) {
        logger.error(error);
    }
}

async function handleRejectedLeaveRequest(leave) {
    try {
        const { leaveType } = leave;
        const { user, projects, approver, approversData, approversEmails } = await getAndAgredateLeaveRequestData(leave);
        const { email, firstName, lastName } = user;

        leave.projectName = projects.map(p => p.name).reduce((a, v) => `${a}, ${v}`);
        leave.approvers = approversData;
        leave.employee = user;
        leave.approver = approver;
        leave.start = moment(leave.start).format(DATE_FORMAT);
        leave.end = moment(leave.end).format(DATE_FORMAT);
        leave.createdAt = moment(leave.createdAt).format(DATETIME_FORMAT);

        const userEmailSubject = `[${leaveType}] Hi ${firstName}, your leave request has been DECLINED`;
        const approverEmailSubject = `[${leaveType}] DECLINED Leave request for: ${firstName} ${lastName}`;

        sendMail(email, userEmailSubject, 'declinedLeaveRequest', leave);
        sendMail(approversEmails.join(','), approverEmailSubject, 'declinedLeaveRequest', leave);
    } catch (error) {
        logger.error(error);
    }
}

async function handleCanceledLeaveRequest(leave) {
    try {
        const { leaveType } = leave;
        const { user, projects, approver, approversData, approversEmails } = await getAndAgredateLeaveRequestData(leave);
        const { email, firstName, lastName } = user;

        leave.projectName = projects.map(p => p.name).reduce((a, v) => `${a}, ${v}`);
        leave.approvers = approversData;
        leave.employee = user;
        leave.approver = approver;
        leave.start = moment(leave.start).format(DATE_FORMAT);
        leave.end = moment(leave.end).format(DATE_FORMAT);
        leave.createdAt = moment(leave.createdAt).format(DATETIME_FORMAT);

        const userEmailSubject = `[${leaveType}] Hi ${firstName}, your leave request has been CANCELED`;
        const approverEmailSubject = `[${leaveType}] CANCELED Leave request for: ${firstName} ${lastName}`;

        sendMail(email, userEmailSubject, 'canceledLeaveRequest', leave);
        sendMail(approversEmails.join(','), approverEmailSubject, 'canceledLeaveRequest', leave);
    } catch (error) {
        logger.error(error);
    }
}

function getUserDetails(_id) {
    return User.findOne({ _id });
}

function getProjectDetails(_id) {
    return Project.findOne({ _id }).populate('approvers');
}

async function getAndAgredateLeaveRequestData(leave) {
    const { userId, lastUpdatedBy } = leave;

    const user = await getUserDetails(userId);
    const { projectRoles } = user;

    const approver = await getUserDetails(lastUpdatedBy);
    const projects = await Promise.all(projectRoles.map(item => getProjectDetails(item.project)));

    const approvers = projects.reduce((a, v) => a.concat(v.approvers), []);
    const approversEmails = _.uniq(approvers.map(i => i.email));

    return {
        user,
        projects,
        approver,
        approversData: approvers,
        approversEmails
    };
}

export { handleNewLeaveRequest, handleLeaveReminder, handleApprovedLeaveRequest, handleRejectedLeaveRequest, handleCanceledLeaveRequest };
