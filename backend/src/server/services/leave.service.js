import _ from 'lodash';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);
import { isWeekDay } from '../helpers/util';
import User from '../models/user.model';
import Holiday from '../models/holiday.model';
import LeaveRequest from '../models/leave-request.model';
import { LEAVE_TYPES, REQUEST_STATUS } from '../helpers/constants';

const excluded = ['in-lieu-leave', 'half-day-leave', 'work-from-home'];

function addDays(base, leave, obj) {
    base[leave.leaveType].count += obj.count;
    base[leave.leaveType].days.push(...obj.days);
}

function createBase() {
    const base = {};
    Object.values(LEAVE_TYPES).forEach(item => base[item] = { count: 0, days: [] });
    return base;
}

function computeDiff(start, end, holidays) {
    const range = moment.range(start, end);
    let dateDiff = Array.from(range.by('d')).reduce((prev, curr) => (isWeekDay(curr) ? ++prev : prev), 0)
    let days = [];

    Array.from(range.by('d')).forEach(day => {
        isWeekDay(day) && days.push(day.format('D'));
    });

    holidays.forEach(holiday => {
        const hDate = moment(holiday.date);
        if (range.contains(hDate) && isWeekDay(hDate)) {
            dateDiff--;
            days = days.filter(day => day !== hDate.format('D'));
        }
    });

    return { days, count: dateDiff };
}

async function getUserIds() {
    return (await User.find({}, '_id')).map(i => i._id);
}

async function getHolidaysPerMonth(userId, month, year) {
    const all = createBase();
    const s = moment().set({ year, month }).subtract(moment().utcOffset(), 'm').startOf('month');
    const e = moment().set({ year, month }).subtract(moment().utcOffset(), 'm').endOf('month');

    const holidays = await Holiday.find({ date: { $gte: s }, date: { $lte: e } });
    const workingDays = computeDiff(s, e, holidays).count;

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

    inMonth.forEach(leave => {
        const start = moment(leave.start);
        const end = moment(leave.end);
        addDays(all, leave, computeDiff(start, end, holidays));
    });

    spanOver.forEach(leave => addDays(all, leave, computeDiff(s, e, holidays)));

    endInMonth.forEach(leave => {
        const end = moment(leave.end);
        addDays(all, leave, computeDiff(s, end, holidays));
    });

    startInMonth.forEach(leave => {
        const start = moment(leave.start);
        addDays(all, leave, computeDiff(start, e, holidays));
    });

    const vacation = _.reduce(all, (prev, next, key) => {
        if (excluded.includes(key)) {
            return prev;
        } else {
            return prev + next.count;
        }
    }, 0);

    all.workDays = workingDays - vacation;

    return all;
}

async function getHolidaysPerYear(year) {
    const userIds = await getUserIds();
    const usersHolidays = {};

    for (let id of userIds) {
        usersHolidays[id] = {};
        for (let month = 0; month < 12; month++) {
            usersHolidays[id][month] = await getHolidaysPerMonth(id, month, year);
        }
    }

    return usersHolidays;
}

async function getHolidaysPerMonthAndYear(month, year) {
    const userIds = await getUserIds();
    const usersHolidays = {};

    for (let id of userIds) {
        usersHolidays[id] = await getHolidaysPerMonth(id, month, year);
        delete usersHolidays[id].workDays
    }

    return usersHolidays;
}

export { getHolidaysPerYear, getHolidaysPerMonthAndYear };
