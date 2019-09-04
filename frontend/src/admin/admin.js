export class Admin {
    configureRouter(config) {
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
                title: 'Manage users',
                auth: true
            },
            {
                route: ['projects'],
                name: 'projects',
                moduleId: './manage/projects/manage-projects',
                nav: true,
                title: 'Manage projects',
                auth: true
            },
            {
                route: ['project-roles'],
                name: 'project-roles',
                moduleId: './manage/project-roles/manage-project-roles',
                nav: true,
                title: 'Manage project roles',
                auth: true
            },
            {
                route: ['holidays'],
                name: 'holidays',
                moduleId: './manage/legal-holidays/manage-holidays',
                nav: true,
                title: 'Manage holidays',
                auth: true
            }
        ]);

        config.mapUnknownRoutes('./404.html');
    }
}
