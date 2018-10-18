import { getHolidaysPerMonth } from '../services/leave.service';

async function getPerMonth(req, res) {
    const monthly = await getHolidaysPerMonth();
    return res.json(monthly);
}

export default { getPerMonth };
