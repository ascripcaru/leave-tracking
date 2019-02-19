import monq from 'monq';

import userWorkers from './users/userWorkers';
import leaveWorkers from './leave/leaveRequestWorkers';

class Worker {
    get queueTypes() {
        return {
            user: 'queue_user',
            leave: 'queue_leave_request'
        };
    }

    get processEvents() {
        return {
            USER: 'process_new_user',
            ANNIVERSARY: 'process_anniversary',
            CHECK_FOR_USERS: 'process_check_for_users',
            PASSWORD_RESET: 'process_password_reset',
            NEW_LEAVE: 'process_new_leave_request',
            LEAVE_REMINDER: 'process_leave_reminder',
            APPROVED_LEAVE: 'process_approved_leave_request',
            REJECTED_LEAVE: 'process_rejected_leave_request',
            CANCELED_LEAVE: 'process_canceled_leave_request'
        };
    }

    constructor() {
        if (!this.client) {
            this.client = monq(process.env.MONGO_HOST);
            this.workers = [];
        }
    }

    start() {
        this.registerWorkers();
        this.startWorkers();

        // in case users collection is empty,
        // a default admin@admin/admin user will be created
        this.queueCheckForUsers();
    }

    queueNewUser(data) {
        const queue = this.client.queue(this.queueTypes.user);
        queue.enqueue(this.processEvents.USER, data, () => {});
    }

    queueAnniversary(data) {
        const queue = this.client.queue(this.queueTypes.user);
        queue.enqueue(this.processEvents.ANNIVERSARY, data, () => {});
    }

    queueCheckForUsers() {
        const queue = this.client.queue(this.queueTypes.user);
        queue.enqueue(this.processEvents.CHECK_FOR_USERS, {}, () => {});
    }

    queuePasswordReset(data) {
        const queue = this.client.queue(this.queueTypes.user);
        queue.enqueue(this.processEvents.PASSWORD_RESET, data, () => {});
    }

    queueNewLeaveRequest(data) {
        const queue = this.client.queue(this.queueTypes.leave);
        queue.enqueue(this.processEvents.NEW_LEAVE, data, () => {});
    }

    queueLeaveReminder(data) {
        const queue = this.client.queue(this.queueTypes.leave);
        queue.enqueue(this.processEvents.LEAVE_REMINDER, data, () => {});
    }

    queueApprovedLeaveRequest(data) {
        const queue = this.client.queue(this.queueTypes.leave);
        queue.enqueue(this.processEvents.APPROVED_LEAVE, data, () => {});
    }

    queueRejectedLeaveRequest(data) {
        const queue = this.client.queue(this.queueTypes.leave);
        queue.enqueue(this.processEvents.REJECTED_LEAVE, data, () => {});
    }

    queueCanceledLeaveRequest(data) {
        const queue = this.client.queue(this.queueTypes.leave);
        queue.enqueue(this.processEvents.CANCELED_LEAVE, data, () => {});
    }

    registerWorkers() {
        this.registerUserWorkers();
        this.registerLeaveRequestWorkers();
    }

    registerUserWorkers() {
        const worker = this.client.worker([this.queueTypes.user]);

        worker.register({
            process_new_user: userWorkers.handleNewUsers,
            process_password_reset: userWorkers.handlePasswordReset,
            process_check_for_users: userWorkers.createDefaultUser,
            process_anniversary: userWorkers.handleEmploymentAnniversary,
        });

        this.workers.push(worker);
    }

    registerLeaveRequestWorkers() {
        const worker = this.client.worker([this.queueTypes.leave]);

        worker.register({
            process_new_leave_request: leaveWorkers.handleNewLeaveRequest,
            process_leave_reminder: leaveWorkers.handleLeaveReminder,
            process_approved_leave_request: leaveWorkers.handleApprovedLeaveRequest,
            process_rejected_leave_request: leaveWorkers.handleRejectedLeaveRequest,
            process_canceled_leave_request: leaveWorkers.handleCanceledLeaveRequest
        });

        this.workers.push(worker);
    }

    startWorkers() {
        this.workers.forEach(worker => worker.start());
    }
}

export default new Worker;
