import moment from 'moment';
import cron from 'node-cron';
import { LEAVE_TYPES } from '../server/helpers/constants';
import LeaveRequest from '../server/models/leave-request.model';

const removeObsoleteWFHAndHalfDay = cron.schedule('0 7 * * *', async () => {
    await LeaveRequest.deleteMany({
        leaveType: { $in: [LEAVE_TYPES.WORK_FROM_HOME, LEAVE_TYPES.HALF_DAY] },
        end: { $lt: moment() },
    });
});

export { removeObsoleteWFHAndHalfDay };
