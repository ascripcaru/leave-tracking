import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { AuthService } from '~/services/auth-service';
import { ValidationFormRenderer } from '~/validators/validation-form-renderer'
import { NotificationService } from 'aurelia-notify';
import { USER_TYPES } from '~/util/constants';
import * as serviceWorker from '~/register-sw';

@inject(AuthService, Router, ValidationControllerFactory, NotificationService)
export class Login {
    user = {
        email: '',
        password: '',
    }
    loading = false;

    rules = ValidationRules
        .ensure('email')
        .required()
        .ensure('password')
        .required()
        .rules;

    constructor(_auth, router, vCtrl, _notify) {
        this._auth = _auth;
        this.router = router;
        this._notify = _notify;

        this.vCtrl = vCtrl.createForCurrentScope();
        this.vCtrl.addRenderer(new ValidationFormRenderer());
    }

    login() {
        const { email, password } = this.user;
        this.loading = true;
        return this.vCtrl.validate()
            .then(re => {
                if (re.valid) {
                    return this._auth.login(email, password);
                } else {
                    return Promise.reject('invalid form');
                }
            })
            .then((me) => {
                if (me.userType === USER_TYPES.ADMIN) {
                    this.router.navigateToRoute('admin');
                } else {
                    this.router.navigateToRoute('home');
                }
                this.loading = false;
                serviceWorker.register();
            })
            .catch((err) => {
                this.loading = false;
                this._notify.danger('Invalid credentials!',
                    { containerSelector: '#loginForm', limit: 1 })
            })
    }

    forgotPassword() {
        this.router.navigateToRoute('recover')
    }

    get canSave() {
        return this.user.email !== ''
            && this.user.password !== ''
            && this.vCtrl.errors.length === 0;
    }
}
