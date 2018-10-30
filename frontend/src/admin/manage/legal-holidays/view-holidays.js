import { inject } from 'aurelia-framework';
import { HolidayService } from '~/services/holiday-service';

@inject(HolidayService)
export class ViewHolidays {
    loading = true;

    constructor(_holiday) {
        this._holiday = _holiday;
    }

    async attached() {
        this.aggregatedHolidays = await this._holiday.getAggregatedHolidays();

        this.loading = false;
    }
}
