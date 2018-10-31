import Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);

import business from 'moment-business';
import { bindable, inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { NotificationService } from 'aurelia-notify';
import { LeaveService } from '~/services/leave-service';
import { UserService } from '~/services/user-service';
import { HolidayService } from '~/services/holiday-service';
import { LEAVE_TYPES, HUMAN_LEAVE_TYPES } from '~/util/constants';

import environment from '~/environment';

@inject(LeaveService, UserService, HolidayService, NotificationService, Router)
export class AddRequest {
    @bindable sPick;
    @bindable ePick;
    @bindable leaveType;

    constructor(_leave, _user, _holiday, _notify, router) {
        this._leave = _leave;
        this._user = _user;
        this._holiday = _holiday;
        this._notify = _notify;
        this.router = router;
    }

    attached() {
        this.disableDates();
        this.computeDiff();
    }

    dateFormat = 'DD-MM-YYYY';
    allowedDate = moment().subtract(1, "days").startOf('day');
    start = moment();
    end = moment();
    holidays = [];
    comment = '';

    pickerOptions = {
        calendarWeeks: true,
        showTodayButton: true,
        showClose: true,
        daysOfWeekDisabled: [0, 6], // we disable saturday & sunday
        format: this.dateFormat,
        minDate: this.allowedDate,
        widgetPositioning: {
            horizontal: 'left'
        }
    };

    selectedLeave = '';
    leaveTypes = Object.keys(LEAVE_TYPES).map(type => {
        const value = LEAVE_TYPES[type];
        return { value, option: HUMAN_LEAVE_TYPES[value] };
    });

    leaveTypeChanged() {
        this.leaveType.events.onChanged = () => {
            if (this.isHalfDaySelected()) {
                this.ePick.methods.date(this.sPick.methods.date());
                this.ePick.methods.disable();
            } else {
                this.ePick.methods.minDate(this.sPick.methods.date());
                this.ePick.methods.enable();
            }
        };
    }

    isHalfDaySelected() {
        return this.leaveType.methods.val() === LEAVE_TYPES.HALF_DAY;
    }

    sPickChanged() {
        this.sPick.events.onChange = () => {
            if (this.isHalfDaySelected()) {
                this.ePick.methods.date(this.sPick.methods.date());
            } else {
                this.ePick.methods.minDate(this.sPick.methods.date());
            }

            this.start = this.sPick.methods.date();

            this.computeDiff();
        }

        this.sPick.events.onHide = () => {
            this.ePick.methods.show();
        }
    }

    ePickChanged() {
        this.ePick.events.onChange = () => {
            this.end = this.ePick.methods.date();
            this.computeDiff();
        }
    }

    computeDiff() {
        const from = moment(this.start);
        const to = moment(this.end);
        const range = moment.range(from, to);
        let dateDiff = business.weekDays(from, to) + 1;

        // go over each holiday and see if the range contains any
        // if it does we do not count that holiday :)
        // it is that easy
        this.holidays.forEach(holiday => {
            const hDate = moment(holiday.date);

            if (range.contains(hDate)) {
                dateDiff--;
            }
        });

        this.dateDiff = dateDiff;
    }

    get canSave() {
        return this.start && this.end && this.dateDiff >= 1;
    }

    async submit(images) {
        if (this.canSave) {
            const user = await this._user.currentUser();
            this.start = moment(this.start).startOf('day').toISOString();
            this.end = moment(this.end).endOf('day').toISOString();

            const form = new FormData();

            form.append('file', images[0], images[0].name);

            const leave = {
                file: images[0],
                userId: user._id,
                leaveType: Array.isArray(this.selectedLeave) ? this.selectedLeave[0] : this.selectedLeave,
                start: this.start,
                end: this.end,
                workDays: this.dateDiff,
                comment: this.comment,
            };
            console.log('====', form);

            // fetch(environment.API_URL + '/files', {
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${localStorage.getItem('token')}`
            //     },
            //     body: form
            //   }).then((response) => {
            //       console.log(response);
            //     return response.json();
            //   }).catch((error) => {
            //     console.log(error);
            //   });

            this._leave.sendFile(form);

            // this._leave.addLeaveRequest(leave)
            //     .then(() => this.router.navigateBack())
            //     .catch(error => {
            //         this._notify.danger(error.message && error.message.message,
            //             { containerSelector: '#add-request', limit: 1 })
            //     });
        }
    }

    async disableDates() {
        const holidays = await this._holiday.getHolidays();
        const disabledDates = holidays.map(h => moment(h.date).toDate());

        this.ePick.methods.disabledDates(disabledDates);
        this.sPick.methods.disabledDates(disabledDates);
        this.holidays = holidays;
    }
}
