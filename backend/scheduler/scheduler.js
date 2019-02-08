import moment from 'moment';
import cron from 'node-cron';
import worker from '../worker/worker';
import User from '../server/models/user.model';
import LeaveRequest from '../server/models/leave-request.model';
import { LEAVE_TYPES, REQUEST_STATUS } from '../server/helpers/constants';

const MAXIMUM_DAYS_PER_YEAR = 27;

const removeObsoleteWFHAndHalfDay = cron.schedule('0 7 * * *', async () => {
    await LeaveRequest.deleteMany({
        leaveType: { $in: [LEAVE_TYPES.WORK_FROM_HOME, LEAVE_TYPES.HALF_DAY] },
        end: { $lt: moment() },
    });
});

const increaseDaysPerYear = cron.schedule('0 3 1 1 *', async () => {
    await User.updateMany({ daysPerYear: { $lt: MAXIMUM_DAYS_PER_YEAR } }, { $inc: { daysPerYear: 1 } });
});

const updateUserHolidaysForNewYear = cron.schedule('0 4 1 1 *', async () => {
    User.find()
        .then(users => {
            users.forEach(async user => {
                user.holidays += user.daysPerYear;
                await user.save();
            });
        });
});

const unapprovedReminder = cron.schedule('0 11 * * *', async () => {
    LeaveRequest.find({ status: REQUEST_STATUS.PENDING, start: { $lt: moment().add(2, 'd') } })
        .then(leaves => {
            leaves.forEach(leave => worker.queueLeaveReminder(leave));
        });
});

const employmentAnniversary = cron.schedule('25 9 * * *', async () => {
    User.aggregate([
        {
            $redact: {
                $cond: {
                    if: {
                        $and: [
                            { $lte: [{ $dayOfYear: '$startDate' }, moment().dayOfYear() + 7] },
                            { $gt: [{ $dayOfYear: '$startDate' }, moment().dayOfYear() + 6] }
                        ]
                    },
                    then: '$$DESCEND',
                    else: '$$PRUNE'
                }
            }
        }
    ])
    .then(users => {
        users.forEach(user => worker.queueAnniversary(user));
    })
});

export { removeObsoleteWFHAndHalfDay, increaseDaysPerYear, updateUserHolidaysForNewYear, unapprovedReminder, employmentAnniversary };
