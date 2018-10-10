import BaseProject from './base-project';

export class CreateProject extends BaseProject {
    project = {
        approvers: [],
        roles: [],
        description: '',
        name: '',
        active: true,
    };

    activate() {
        this.setTemplateParams();
        this.project.submit = this.createProject.bind(this);
    }

    setTemplateParams() {
        this.ctaButtonLabel = 'Create project';
    }
}