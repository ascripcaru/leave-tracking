import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { UserService } from '~/services/user-service';
import { ProjectService } from '~/services/project-service';

@inject(UserService, ProjectService, Router)
export class Admin {
    constructor(_user, _project, router) {
        this._user = _user;
        this._project = _project;
    }

    configureRouter(config, router) {
        config.map([
            {
                route: [''],
                name: 'admin',
                moduleId: './dash',
                nav: true,
                title: 'Admin',
                auth: true
            },
            {
                route: ['users'],
                name: 'users',
                moduleId: './manage/users/manage-users',
                nav: true,
                title: 'Manage Users',
                auth: true
            },
            {
                route: ['projects'],
                name: 'projects',
                moduleId: './manage/projects/manage-projects',
                nav: true,
                title: 'Manage Projects',
                auth: true
            },
            {
                route: ['project-roles'],
                name: 'project-roles',
                moduleId: './manage/project-roles/manage-project-roles',
                nav: true,
                title: 'Manage Project Roles',
                auth: true
            },
            {
                route: ['holidays'],
                name: 'holidays',
                moduleId: './manage/legal-holidays/manage-holidays',
                nav: true,
                title: 'Manage Holidays',
                auth: true
            },
            {
                route: ['reports'],
                name: 'reports',
                moduleId: './reports/reports',
                nav: true,
                title: 'User statistics',
                auth: true
            },
            {
                route: ['reports/advanced'],
                name: 'advanced-reports',
                moduleId: './reports/advanced/advanced-reports',
                nav: true,
                title: 'Advanced reports',
                auth: true
            }
        ]);

        config.mapUnknownRoutes('./404.html');
    }
}
