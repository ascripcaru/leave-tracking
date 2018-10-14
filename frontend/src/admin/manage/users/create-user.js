import BaseUser from './base-user';

export class CreateUser extends BaseUser {
    user = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        projectRoles: [{ project: '', role: '' }],
        daysPerYear: 24,
        holidays: 24,
        userType: ''
    };

    activate() {
        this.setTemplateParams();
        this.user.submit = this.create.bind(this);
    }

    setTemplateParams() {
        this.ctaButtonLabel = 'Create user';
    }
}
