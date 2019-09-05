import { bindable, inject } from 'aurelia-framework';
import { UserService } from '~/services/user-service';
import { ReportsService } from '~/services/reports-service';
import moment from 'moment';

@inject(ReportsService, UserService)
export class AdvancedReports {
    @bindable currentYear;
    @bindable currentMonth;

    loading = true;

    constructor(_reports, _user) {
        this.showWorked = false;
        this._reports = _reports;
        this._user = _user;
        this.monthNames = moment.monthsShort().map((val, index) => ({ option: val, id: index }));
        this.currentMonth = moment().month();
        this.currentYear = moment().year();
        this.years = [this.currentYear - 1, this.currentYear, this.currentYear + 1];
    }

    currentYearChanged() {
        this.loading = true;
        this.processReport();
    }

    currentMonthChanged() {
        this.loading = true;
        this.processReport();
    }

    async attached() {
        this.users = await this._user.getUsers();
        this.processReport();
    }

    async processReport() {
        this.reports = await this._reports.getPerMonthAndYear(this.currentMonth, this.currentYear);

        this.userIds = this.users.map(user => user._id);
        this.leaveTypes = Object.keys(this.reports[this.userIds[0]]);

        this.loading = false;
    }

    print() {
        window.print();
    }

    getValues(obj) {
        return Object.values(obj);
    }

    getUserName(id) {
        return this.users.filter(i => i._id === id)[0].fullName;
    }
}
