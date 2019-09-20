import moment from 'moment';
import cron from 'node-cron';
import { handleEmploymentAnniversary } from '../worker/userWorker';
import { handleLeaveReminder } from '../worker/leaveRequestWorker';
import User from '../server/models/user.model';
import LeaveRequest from '../server/models/leave-request.model';
import { REQUEST_STATUS } from '../server/helpers/constants';

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
            leaves.forEach(leave => handleLeaveReminder(leave.toObject()));
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
    ]).then(users => {
        users.forEach(user => handleEmploymentAnniversary(user.toObject()));
    });
});

export { updateUserHolidaysForNewYear, unapprovedReminder, employmentAnniversary };
