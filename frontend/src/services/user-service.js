import { inject } from 'aurelia-framework';
import { UserModel } from '~/models/user-model';
import { ApiService } from './api-service';
import { AuthService } from './auth-service';
import { USER_TYPES } from '~/util/constants';

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

    getQueryParams(name, limit, type) {
        let q = `limit=${limit}&name=${name}&fields=firstName,lastName,email`;
        if (Array.isArray(type)) q += `&userType=${type.reduce((a, c) => `${a},${c}`)}`;
        return q;
    }

    searchUser(name, limit, type) {
        return this.http.get(`users?${this.getQueryParams(name, limit, type)}`)
            .then(users => users.map(x => new UserModel(x)));
    }

    searchApproverUser(name, limit) {
        return this.searchUser(name, limit, [USER_TYPES.APPROVER, USER_TYPES.ADMIN]);
    }
}
