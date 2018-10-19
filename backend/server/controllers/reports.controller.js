import { getHolidaysPerYear } from '../services/leave.service';

async function getPerYear(req, res) {
    const monthly = await getHolidaysPerYear();
    return res.json(monthly);
}

export default { getPerYear };
