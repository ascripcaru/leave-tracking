import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { ProjectService } from '~/services/project-service';
import { UserService } from '~/services/user-service';
import { BaseProject } from './base-project';

@inject(ProjectService, Router, UserService)
export class CreateProject extends BaseProject {
    constructor(_project, router, _user) {
        super();
        this.router = router;
        this.project = {};
    }

    createProject() {
        this._project.createProject(this.project)
            .then(() => this.router.navigateBack());
    }
}