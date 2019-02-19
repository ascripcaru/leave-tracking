import APIError from '../helpers/APIError';
import { filterInt } from '../helpers/util';
import { getHolidaysPerYear } from '../services/leave.service';

async function getPerYear(req, res, next) {
    const year = filterInt(req.params.year);
    if (!isNaN(year) && year >= 2010 && year <= 2100) {
        const monthly = await getHolidaysPerYear(year);
        return res.json(monthly);
    } else {
        return next(new APIError('Cannot query report for that year.', 400, true));
    }
}

export default { getPerYear };
