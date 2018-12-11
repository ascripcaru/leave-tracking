import { bindable, inject } from 'aurelia-framework';
import { UserService } from '~/services/user-service';
import { ReportsService } from '~/services/reports-service';
import { HUMAN_LEAVE_TYPES } from '../../../util/constants';
import moment from 'moment';

@inject(ReportsService, UserService)
export class AdvancedReports {
    @bindable currentYear;

    loading = true;

    constructor(_reports, _user) {
        this.showWorked = false;
        this._reports = _reports;
        this._user = _user;
        this.types = Object.keys(HUMAN_LEAVE_TYPES);
        this.monthNames = moment.monthsShort();
        this.total = {};
        this.currentYear = moment().year();
        this.years = [this.currentYear - 1, this.currentYear, this.currentYear + 1];
    }

    currentYearChanged(value) {
        this.loading = true;
        this.processReport(value);
    }

    async attached() {
        this.users = await this._user.getUsers();
        this.processReport(this.currentYear);
    }

    async processReport(year) {
        this.reports = await this._reports.getPerYear(this.currentYear);

        this.userIds = this.users.map(user => user._id);
        this.months = Object.entries(this.reports);

        this.calculateTotal(this.reports);
        this.loading = false;
    }

    print() {
        window.print();
    }

    createBase() {
        const base = {};
        Object.keys(HUMAN_LEAVE_TYPES).forEach(item => base[item] = { count: 0 });
        return base;
    }

    calculateTotal(obj) {
        Object.entries(obj).forEach(entry => {
            this.total[entry[0]] = Object.values(entry[1]).reduce((a, c) => {
                Object.keys(a).forEach(key => a[key].count += c[key].count);
                return a;
            }, this.createBase());
        });
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
