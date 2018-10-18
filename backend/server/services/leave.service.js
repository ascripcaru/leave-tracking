import Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);
import business from 'moment-business';

import Holiday from '../models/holiday.model';
import LeaveRequest from '../models/leave-request.model';
import { LEAVE_TYPES, REQUEST_STATUS } from '../helpers/constants';

function addDays(base, leave, days) {
    if (days == undefined) {
        days = leave.workDays;
    }
    base[leave.leaveType] += days;
}

function createBase() {
    const base = {};

    Object.values(LEAVE_TYPES).forEach(item => base[item] = 0);

    return base;
}

function computeDiff(start, end, holidays) {
    const range = moment.range(start, end);
    let dateDiff = business.weekDays(start, end) + 1;

    holidays.forEach(holiday => {
        if (range.contains(moment(holiday.date))) {
            dateDiff--;
        }
    });

    return dateDiff;
}

async function getHolidaysPerMonth() {
    const holidays = await Holiday.find();
    const monthly = [];

    for (let i = 0; i < 12; i++) {
        const all = createBase();
        const s = moment().month(i).subtract(moment().utcOffset(), 'm').startOf('month');
        const e = moment().month(i).subtract(moment().utcOffset(), 'm').endOf('month');

        const inMonth = await LeaveRequest.find({
            status: REQUEST_STATUS.APPROVED,
            start: { $gt: s },
            end: { $lt: e }
        });
        const endInMonth = await LeaveRequest.find({
            status: REQUEST_STATUS.APPROVED,
            start: { $lt: s },
            end: { $gt: s, $lt: e }
        });
        const startInMonth = await LeaveRequest.find({
            status: REQUEST_STATUS.APPROVED,
            start: { $gt: s, $lt: e },
            end: { $gt: e }
        });
        const spanOver = await LeaveRequest.find({
            status: REQUEST_STATUS.APPROVED,
            start: { $lt: s },
            end: { $gt: e }
        });

        inMonth.forEach(leave => addDays(all, leave));
        spanOver.forEach(leave => addDays(all, leave, computeDiff(s, e, holidays)));

        endInMonth.forEach(leave => {
            const end = moment(leave.end);
            addDays(all, leave, computeDiff(s, end, holidays));
        });

        startInMonth.forEach(leave => {
            const start = moment(leave.start);
            addDays(all, leave, computeDiff(start, e, holidays));
        });

        monthly.push(all);
    }

    return monthly;
}

export { getHolidaysPerMonth };
