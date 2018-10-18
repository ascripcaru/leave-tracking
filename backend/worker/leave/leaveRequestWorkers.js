import _ from 'lodash';
import moment from 'moment';
import smtp from '../../smtp/smtp';
import User from '../../server/models/user.model';
import Project from '../../server/models/project.model';

const DATE_FORMAT = 'DD MMM YYYY';
const DATETIME_FORMAT = 'DD MMM YYYY HH:mm';

async function handleNewLeaveRequest(leave, callback) {
    try {
        const { leaveType } = leave;
        const { user, projects, approversData, approversEmails } = await getAndAgredateLeaveRequestData(leave);
        const { email, firstName, lastName } = user;

        leave.projectName = projects.map(p => p.name).reduce((a, v) => `${a}, ${v}`);
        leave.approvers = approversData;
        leave.employee = user;
        leave.start = moment(leave.start).format(DATE_FORMAT);
        leave.end = moment(leave.end).format(DATE_FORMAT);
        leave.createdAt = moment(leave.createdAt).format(DATETIME_FORMAT);

        const userEmailSubject = `[${leaveType}] Hi ${firstName}, here is your leave request`;
        const approverEmailSubject = `[${leaveType}] Leave request pending for: ${firstName} ${lastName}`;

        Promise.all([
            smtp.sendMail(email, userEmailSubject, 'newUserLeaveRequest', leave),
            smtp.sendMail(approversEmails.join(','), approverEmailSubject, 'newApproverLeaveRequest', leave)
        ]).then(info => callback(null, info));
    } catch (error) {
        console.log('handleNewLeaveRequest:', error);
        return callback(error);
    }
}

async function handleLeaveReminder(leave, callback) {
    try {
        const { leaveType } = leave;
        const { user, projects, approversData, approversEmails } = await getAndAgredateLeaveRequestData(leave);
        const { firstName, lastName } = user;

        leave.projectName = projects.map(p => p.name).reduce((a, v) => `${a}, ${v}`);
        leave.approvers = approversData;
        leave.employee = user;
        leave.start = moment(leave.start).format(DATE_FORMAT);
        leave.end = moment(leave.end).format(DATE_FORMAT);
        leave.createdAt = moment(leave.createdAt).format(DATETIME_FORMAT);

        const approverEmailSubject = `[${leaveType}] REMINDER Leave request pending for: ${firstName} ${lastName}`;

        Promise.all([
            smtp.sendMail(approversEmails.join(','), approverEmailSubject, 'newApproverLeaveRequest', leave)
        ]).then(info => callback(null, info));
    } catch (error) {
        console.log('handleLeaveReminder:', error);
        return callback(error);
    }
}

async function handleApprovedLeaveRequest(leave, callback) {
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

        Promise.all([
            smtp.sendMail(`${email},${approvedCopyEmailAddress}`, userEmailSubject, 'approvedLeaveRequest', leave),
            smtp.sendMail(approversEmails.join(','), approverEmailSubject, 'approvedLeaveRequest', leave)
        ]).then(info => callback(null, info));
    } catch (error) {
        console.log('handleApprovedLeaveRequest:', error);
        return callback(error);
    }
}

async function handleRejectedLeaveRequest(leave, callback) {
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

        Promise.all([
            smtp.sendMail(email, userEmailSubject, 'declinedLeaveRequest', leave),
            smtp.sendMail(approversEmails.join(','), approverEmailSubject, 'declinedLeaveRequest', leave)
        ]).then(info => callback(null, info));
    } catch (error) {
        console.log('handleRejectedLeaveRequest:', error);
        return callback(error);
    }
}

async function handleCanceledLeaveRequest(leave, callback) {
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
        Promise.all([
            smtp.sendMail(email, userEmailSubject, 'canceledLeaveRequest', leave),
            smtp.sendMail(approversEmails.join(','), approverEmailSubject, 'canceledLeaveRequest', leave)
        ]).then(info => callback(null, info));
    } catch (error) {
        console.log('handleCanceledLeaveRequest:', error);
        return callback(error);
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

export default { handleNewLeaveRequest, handleLeaveReminder, handleApprovedLeaveRequest, handleRejectedLeaveRequest, handleCanceledLeaveRequest };
