import { inject } from 'aurelia-framework';
import { ApiService } from './api-service';

@inject(ApiService)
export class ReportsService {

    constructor(api) {
        this.http = api.http;
    }

    getAll() {
        return this.http.get('reports');
    }
}
