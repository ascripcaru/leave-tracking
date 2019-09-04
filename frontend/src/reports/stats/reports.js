import { inject } from 'aurelia-framework';
import { UserService } from '~/services/user-service';

@inject(UserService)
export class Reports {

    constructor(_user) {
        this._user = _user;
    }

    print() {
        window.print();
    }

    async attached() {
        this.getUsers();
    }

    async getUsers() {
        this.users = await this._user.getUsers();
    }
}
