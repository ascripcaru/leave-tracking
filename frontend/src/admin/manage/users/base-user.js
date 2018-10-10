import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { UserService } from '~/services/user-service';
import { ProjectService } from '~/services/project-service';
import { ProjectRoleService } from '~/services/project-role-service';
import {
    ValidationRules,
    ValidationControllerFactory,
    validateTrigger
} from 'aurelia-validation';
import { BootstrapFormRenderer } from '~/components/validation/bootstrap-form-renderer';
import { compareObjects, setupValidationControllers } from '~/util/utils';
import { MultiObserver } from '~/util/multi-observer';
import moment from 'moment';

let attachObserver = true;

@inject(UserService, ProjectService, ProjectRoleService, Router, ValidationControllerFactory, MultiObserver)
export default class BaseUser {
    pickerOptions = {
        showTodayButton: true,
        showClose: true,
        format: 'YYYY-MM-DD',
        widgetPositioning: {
            vertical: 'bottom'
        }
    };

    constructor(_user, _project, _projectRole, router, controllerFactory, _observe) {
        this._user = _user;
        this._project = _project;
        this._projectRole = _projectRole;
        this.router = router;
        this._observe = _observe;
        this.originalUser = {};

        setupValidationControllers(controllerFactory, BootstrapFormRenderer, this, validateTrigger);
    }

    attached() {
        ValidationRules
            .ensure('startDate').satisfies(obj => obj instanceof Date)
            .ensure('firstName').required()
            .ensure('lastName').required()
            .ensure('email').required().email()
            .ensure('password').required().minLength(5)
            .ensure('daysPerYear').satisfiesRule('integerRange', 0, 500)
            .ensure('holidays').satisfiesRule('integerRange', 0, 500)
            .ensure('position').satisfiesRule('otherThan', 'None', true)
            .ensure('userType').satisfiesRule('otherThan', 'None')
            .ensure('projectId').satisfiesRule('otherThan', 'None', true)
            .on(this.user);

        if (attachObserver) {
            attachObserver = false;
            this._observe.observe([
                    [this.user, 'projectId']
                ],
                projectId => this.fetchProjectRoles(projectId));
        }
    }

    unbind() {
        attachObserver = true;
    }

    get canSave() {
        return compareObjects(this.user, this.originalUser);
    }

    async activate(model) {
        this.user = model;
        this.user.startDate = moment(model.startDate);
        this.originalUser = JSON.parse(JSON.stringify(this.user));

        await this.fetchProjectsData();
    }

    async fetchData() {
        await this.fetchProjectsData();
    }

    async fetchProjectsData() {
        const projects = await this._project.getProjects();
        this.projects = projects;
    }

    async save() {
        this.sanitizeFields(this.user);

        await this._user.saveUser(this.user);
        this.router.navigateBack();
    }

    async create() {
        this.sanitizeFields(this.user);

        await this._user.createUser(this.user);
        this.router.navigateToRoute('users');
    }

    async delete() {
        await this._user.deleteUser(this.user._id);
        this.router.navigateBack();
    }

    submit() {
        return this.controller.validate()
            .then(result => result.valid && this.user.submit());
    }

    async fetchProjectRoles(projectId) {
        if (projectId === 'None' || !projectId) {
            return this.roles = [];
        }
        const { roles }  = await this._project.getProject(projectId);

        this.roles = roles;
    }

    sanitizeFields(user) {
        const { position, projectId } = user;
        if (position === 'None') {
            delete user.position;
        }

        if (projectId === 'None') {
            delete user.projectId;
        }
    }
}
