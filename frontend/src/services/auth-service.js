import { inject } from 'aurelia-framework';
import { ApiService } from './api-service';
import { UserModel } from '~/models/user-model';
import { Events } from './events';
import { USER_TYPES } from '~/util/constants';

@inject(ApiService, Events)
export class AuthService {
    meData = {};

    constructor(_api, _events) {
        this.http = _api.http;
        this._api = _api;
        this._events = _events;
    }

    /**
    * Send credentials to server
    * reconfigures httpClient to use the authorization header
    * calls /me endpoint
    * @returns {User}
    **/
    login(email, password) {
        return this.http.post('auth/login', { email, password })
            .then(response => {
                const { token } = response;

                this._api.attachToken(token);
                localStorage.setItem('token', token);

                return this.me();
            });
    }

    logout() {
        localStorage.removeItem('me');
        localStorage.removeItem('token');
    }

    get isAuth() {
        const token = localStorage.getItem('token') || false;
        if (!token) {
            this._events.ea.publish('no_token');
        }

        return !!token;
    }

    me() {
        return this.http.get('auth/me')
            .then(response => {
                const meData = new UserModel(response);
                localStorage.setItem('me', JSON.stringify(meData))
                return meData;
            })
    }

    localData() {
        return (localStorage.getItem('me') && JSON.parse(localStorage.getItem('me'))) || null;
    }

    get isAdvancedUser() {
        return (this.localData() && this.localData().userType === USER_TYPES.ADVANCED_USER) || false
    }

    get isAdmin() {
        return (this.localData() && this.localData().userType === USER_TYPES.ADMIN) || false
    }

    get isApprover() {
        return (this.localData() && this.localData().userType === USER_TYPES.APPROVER) || false
    }

    recover(email) {
        return this.http.post('auth/recover', { email });
    }

    reset(password, confirmPassword, token) {
        return this.http.post('auth/reset', { password, confirmPassword, token });
    }
}
