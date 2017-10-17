import monq from 'monq';

import userWorkers from './users/userWorkers';
import leaveWorkers from './leave/leaveRequestWorkers';

class Worker {
    get QUEUE_EVENTS() {
        return {
            USER: 'queue_user',
            LEAVE: 'queue_leave_request'
        };
    }

    get PROCESS_EVENTS() {
        return {
            USER: 'process_new_user',
            NEW_LEAVE: 'process_new_leave_request',
            APPROVED_LEAVE: 'process_approved_leave_request',
            REJECTED_LEAVE: 'process_rejected_leave_request'
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
    }

    queueNewUser(data) {
        const queue = this.client.queue(this.QUEUE_EVENTS.USER);

        queue.enqueue(this.PROCESS_EVENTS.USER, data, () => {});
    }

    queueNewLeaveRequest(data) {
        const queue = this.client.queue(this.QUEUE_EVENTS.LEAVE);

        queue.enqueue(this.PROCESS_EVENTS.NEW_LEAVE, data, () => {});
    }

    queueApprovedLeaveRequest(data) {
        const queue = this.client.queue(this.QUEUE_EVENTS.LEAVE);

        queue.enqueue(this.PROCESS_EVENTS.APPROVED_LEAVE, data, () => {});
    }

    queueRejectedLeaveRequest(data) {
        const queue = this.client.queue(this.QUEUE_EVENTS.LEAVE);

        queue.enqueue(this.PROCESS_EVENTS.REJECTED_LEAVE, data, () => {});
    }

    registerWorkers() {
        this.registerUserWorkers();
        this.registerLeaveRequestWorkers();
    }

    registerUserWorkers() {
        const worker = this.client.worker([this.QUEUE_EVENTS.USER]);

        worker.register({
            process_new_user: userWorkers.handleNewUsers
        });

        this.workers.push(worker);
    }

    registerLeaveRequestWorkers() {
        const worker = this.client.worker([this.QUEUE_EVENTS.LEAVE]);

        worker.register({
            process_new_leave_request: leaveWorkers.handleNewLeaveRequest,
            process_approved_leave_request: leaveWorkers.handleApprovedLeaveRequest,
            process_rejected_leave_request: leaveWorkers.handleRejectedLeaveRequest
        });

        this.workers.push(worker);
    }

    startWorkers() {
        this.workers.forEach(worker => worker.start());
    }
}

export default new Worker;