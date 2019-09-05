import { filterInt } from '../helpers/util';
import { getHolidaysPerYear, getHolidaysPerMonthAndYear } from '../services/leave.service';

async function getPerYear(req, res, next) {
    const year = filterInt(req.params.year);
    if (!isNaN(year) && year >= 2010 && year <= 2100) {
        const monthly = await getHolidaysPerYear(year);
        return res.json(monthly);
    } else {
        return res.status(400).json({ message: 'Cannot query report for that year.' })
    }
}

async function getPerMonthAndYear(req, res, next) {
    const year = filterInt(req.params.year);
    const month = filterInt(req.params.month);

    const yearCond = !isNaN(year) && year >= 2010 && year <= 2100;
    const monthCond = !isNaN(month) && month >= 0 && month <= 11;

    if (yearCond && monthCond) {
        const monthly = await getHolidaysPerMonthAndYear(month, year);
        return res.json(monthly);
    } else {
        return res.status(400).json({ message: 'Cannot query report for that month and year combination.' })
    }
}

export default { getPerYear, getPerMonthAndYear };
