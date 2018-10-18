import { inject } from 'aurelia-framework';
import { ReportsService } from '~/services/reports-service';

@inject(ReportsService)
export class Audit {
    loading = true;

    constructor(_reports) {
        this._reports = _reports;
    }

    async attached() {
        this.audits = await this._reports.getAll();
        this.loading = false;
    }
}
