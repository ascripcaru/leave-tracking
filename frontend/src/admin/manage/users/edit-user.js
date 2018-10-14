import BaseUser from './base-user';

export class EditUser extends BaseUser {

    async activate(params) {
        this.setTemplateParams();
        await this.fetchData(params);
    }

    setTemplateParams() {
        this.ctaButtonLabel = 'Save';
        this.isEdit = true;
    }

    async fetchData(params) {
        this.user = await this._user.getUser(params.userId);
        this.user.projectRoles.forEach(item => {
            item.project = item.project._id;
            item.role = item.role._id;
        });
        this.user.submit = this.save.bind(this);
    }

    async delete() {
        await this._user.deleteUser(this.user._id);
        this.router.navigateBack();
    }
}
