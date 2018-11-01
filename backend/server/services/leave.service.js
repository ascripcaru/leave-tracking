import Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);
import business from 'moment-business';
import User from '../models/user.model';
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
        const hDate = moment(holiday.date);
        if (range.contains(hDate) && business.isWeekDay(hDate)) {
            dateDiff--;
        }
    });

    return dateDiff;
}

async function getUserIds() {
    return (await User.find({}, '_id')).map(i => i._id);
}

async function getHolidaysPerMonth(userId, month, year, holidays) {
    const all = createBase();
    const s = moment().set({ year, month }).subtract(moment().utcOffset(), 'm').startOf('month');
    const e = moment().set({ year, month }).subtract(moment().utcOffset(), 'm').endOf('month');

    const inMonth = await LeaveRequest.find({
        userId,
        status: REQUEST_STATUS.APPROVED,
        start: { $gte: s },
        end: { $lte: e }
    });
    const endInMonth = await LeaveRequest.find({
        userId,
        status: REQUEST_STATUS.APPROVED,
        start: { $lt: s },
        end: { $gte: s, $lte: e }
    });
    const startInMonth = await LeaveRequest.find({
        userId,
        status: REQUEST_STATUS.APPROVED,
        start: { $gte: s, $lte: e },
        end: { $gt: e }
    });
    const spanOver = await LeaveRequest.find({
        userId,
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

    return all;
}

async function getHolidaysPerYear(year) {
    const holidays = await Holiday.find();
    const users = await getUserIds();
    const usersHolidays = {};

    for (let id of users) {
        usersHolidays[id] = {};
        for (let month = 0; month < 12; month++) {
            usersHolidays[id][month] = await getHolidaysPerMonth(id, month, year, holidays);
        }
    }

    return usersHolidays;
}

export { getHolidaysPerYear };
