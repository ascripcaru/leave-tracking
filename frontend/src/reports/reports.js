export class Reports {
    configureRouter(config) {
        config.map([
            {
                route: [''],
                name: 'reports',
                moduleId: './dash',
                nav: true,
                title: 'Reports',
                auth: true
            },
            {
                route: ['stats'],
                name: 'stats',
                moduleId: './stats/reports',
                nav: true,
                title: 'User statistics',
                auth: true
            },
            {
                route: ['advanced'],
                name: 'advanced-reports',
                moduleId: './advanced/advanced-reports',
                nav: true,
                title: 'Advanced reports',
                auth: true
            },
            {
                route: ['payroll'],
                name: 'payroll-reports',
                moduleId: './payroll/advanced-reports',
                nav: true,
                title: 'Payroll reports',
                auth: true
            }
        ]);

        config.mapUnknownRoutes('./404.html');
    }
}
