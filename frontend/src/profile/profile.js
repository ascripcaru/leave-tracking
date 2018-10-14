import { inject } from 'aurelia-framework';
import { UserService } from '~/services/user-service';

@inject(UserService)
export class Profile {
    constructor(_user) {
        this.userLoaded = false;
        this._user = _user;
    }

    async attached() {
        this.user = await this._user.currentUser();
        this.userLoaded = true;
    }
}
