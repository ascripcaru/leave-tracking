import { inject } from 'aurelia-framework';
import { UserService } from '~/services/user-service';
import { ReportsService } from '~/services/reports-service';
import { HUMAN_LEAVE_TYPES } from '../../util/constants';
import moment from 'moment';

@inject(ReportsService, UserService)
export class Audit {
    loading = true;

    constructor(_reports, _user) {
        this._reports = _reports;
        this._user = _user;
        this.types = Object.keys(HUMAN_LEAVE_TYPES);
        this.monthNames = moment.monthsShort();
    }

    async attached() {
        this.users = await this._user.getUsers();
        this.reports = await this._reports.getAll();

        this.userIds = Object.keys(this.reports);
        this.months = Object.entries(this.reports);

        this.loading = false;
    }

    getValues(obj) {
        return Object.values(obj);
    }

    getEntries(obj) {
        return Object.entries(obj);
    }

    getUserName(id) {
        return this.users.filter(i => i._id === id)[0].fullName;
    }
}
