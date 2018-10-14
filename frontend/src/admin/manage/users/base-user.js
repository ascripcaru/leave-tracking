import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { UserService } from '~/services/user-service';
import { ProjectService } from '~/services/project-service';
import {
    ValidationRules,
    ValidationControllerFactory,
    validateTrigger
} from 'aurelia-validation';
import { BootstrapFormRenderer } from '~/components/validation/bootstrap-form-renderer';
import { compareObjects, setupValidationControllers } from '~/util/utils';
import moment from 'moment';

@inject(UserService, ProjectService, Router, ValidationControllerFactory)
export default class BaseUser {
    pickerOptions = {
        showTodayButton: true,
        showClose: true,
        format: 'DD-MM-YYYY',
        widgetPositioning: {
            vertical: 'bottom'
        }
    };

    constructor(_user, _project, router, controllerFactory) {
        this._user = _user;
        this._project = _project;
        this.router = router;
        this.originalUser = {};

        setupValidationControllers(controllerFactory, BootstrapFormRenderer, this, validateTrigger);
    }

    attached() {
        this.projectRules = ValidationRules
            .ensure('project').required()
            .ensure('role').required()
            .rules;

        ValidationRules
            .ensure('startDate').satisfies(obj => obj instanceof Date)
            .ensure('firstName').required()
            .ensure('lastName').required()
            .ensure('email').required().email()
            .ensure('password').required().minLength(5)
            .ensure('daysPerYear').satisfiesRule('integerRange', 0, 100)
            .ensure('holidays').satisfiesRule('integerRange', 0, 100)
            .ensure('userType').satisfiesRule('otherThan', 'None')
            .on(this.user);

        this.user.projectRoles.forEach(i => {
            this.controller.addObject(i, this.projectRules);
        });
    }

    detached() {
        this.user.projectRoles.forEach(i => {
            this.controller.removeObject(i);
        });
    }

    get canSave() {
        return compareObjects(this.user, this.originalUser);
    }

    async activate(model) {
        await this.fetchProjectsData();
        this.user = model;
        this.user.startDate = moment(model.startDate);
        this.originalUser = JSON.parse(JSON.stringify(this.user));
    }

    async fetchProjectsData() {
        const projects = await this._project.getProjects();
        this.projects = projects;
    }

    async save() {
        await this._user.saveUser(this.user);
        this.router.navigateBack();
    }

    async create() {
        await this._user.createUser(this.user);
        this.router.navigateToRoute('users');
    }

    addRole() {
        const newRole = { project: '', role: '' };
        this.user.projectRoles.push(newRole);
        this.controller.addObject(newRole, this.projectRules);
    }

    removeRole(index) {
        const res = this.user.projectRoles.splice(index, 1);
        this.controller.removeObject(res[0]);
    }

    roles(id) {
        const project = this.projects.filter(i => i._id === id)[0];
        return project ? project.roles : [];
    }

    async delete() {
        await this._user.deleteUser(this.user._id);
        this.router.navigateBack();
    }

    submit() {
        return this.controller.validate()
            .then(result => result.valid && this.user.submit());
    }
}
