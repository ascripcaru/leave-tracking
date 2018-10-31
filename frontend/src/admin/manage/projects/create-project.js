import BaseProject from './base-project';

export class CreateProject extends BaseProject {
    project = {
        approvers: [],
        roles: [],
        description: '',
        name: '',
        active: true,
    };

    async activate() {
        this.project.roles = await this._projectRole.getProjectRoles();
        this.project.submit = this.createProject.bind(this);

        this.setTemplateParams();
    }

    setTemplateParams() {
        this.ctaButtonLabel = 'Create project';
    }
}
