import { inject } from 'aurelia-framework';
import { UserModel } from '~/models/user-model';
import { ApiService } from './api-service';
import { AuthService } from './auth-service';

@inject(ApiService, AuthService)
export class UserService {

    constructor(_api, _auth) {
        this.http = _api.http;
        this._auth = _auth;
    }

    getUser(id) {
        return this.http.get(`users/${id}`)
            .then(user => new UserModel(user));
    }

    currentUser() {
        return this._auth.me();
    }

    createUser(user) {
        return this.http.post('users', user);
    }

    saveUser(user) {
        return this.http.put(`users/${user._id}`, user);
    }

    deleteUser(userID) {
        return this.http.delete(`users/${userID}`);
    }

    async getLeaves() {
        const me = await this.currentUser();

        return this.http.get(`users/${me._id}/leaves`);
    }

    getUsers() {
        return this.http.get('users')
            .then(users => users.map(x => new UserModel(x)));
    }

    getQueryParams(name, type, limit) {
        const userType = type.reduce((a, c) => `${a},${c}`);
        return `limit=${limit}&name=${name}&fields=firstName,lastName,email${_.isUndefined(type) ? '' : '&userType=' + userType}`;
    }

    searchUser(name, type, limit = 10) {
        return this.http.get(`users?${this.getQueryParams(name, type, limit)}`)
            .then(users => users.map(x => new UserModel(x)));
    }

    searchUserByName(name) {
        return this.searchUser(name);
    }

    searchApproverUserByName(name) {
        return this.searchUser(name, ['APPROVER', 'ADMIN']);
    }
}
