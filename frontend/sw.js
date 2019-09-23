self.addEventListener('push', function(event) {
    const options = {
        icon: 'issco-logo.png',
        vibrate: [50, 50],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: Date.now(),
            domain: null,
        }
    };

    const payload = event.data.json();

    if (self.Notification.permission === 'granted') {
        options.body = payload.body;
        options.data.domain = payload.domain;

        event.waitUntil(
            self.registration.showNotification(payload.title, options)
        );
    }
});

self.addEventListener('notificationclick', function(event) {
    self.registration.getNotifications().then(function(notifications) {
        notifications.forEach(function(notification) {
            notification.close();
        });
    });

    event.waitUntil(
        clients.openWindow(event.notification.data.domain)
    );
});
