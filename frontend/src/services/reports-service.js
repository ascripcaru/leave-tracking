import { inject } from 'aurelia-framework';
import { ApiService } from './api-service';

@inject(ApiService)
export class ReportsService {

    constructor(api) {
        this.http = api.http;
    }

    getPerYear(year) {
        return this.http.get(`reports/${year}`);
    }

    getPerMonthAndYear(month, year) {
        return this.http.get(`reports/${month}/${year}`);
    }
}
