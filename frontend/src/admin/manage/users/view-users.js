import { inject } from 'aurelia-framework';
import { UserService } from '~/services/user-service';

@inject(UserService)
export class ViewUsers {
    loading = true;
    constructor(_user) {
        this._user = _user;
    }

    async attached() {
        this.users = await this._user.getUsers();
        this.loading = false;
    }
}
