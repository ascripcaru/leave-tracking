self.addEventListener('push', function(event) {
    const options = {
        icon: 'issco-logo.png',
        vibrate: [50, 50],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: Date.now(),
        }
    };

    const payload = event.data.json();

    if (self.Notification.permission === 'granted') {
        event.waitUntil(
            self.registration.showNotification(payload.title,
                Object.assign({ body: payload.body, domain: payload.domain }, options))
        );
    }
});

self.addEventListener('notificationclick', function(event) {
    self.registration.getNotifications().then(function(notifications) {
        notifications.forEach(function(notification) {
            notification.close();
        });
    });

    clients.matchAll().then(function(allClients) {
        const visibleClient = allClients.find(function(client) {
            client.visibilityState === 'visible';
        });

        if (visibleClient) {
            visibleClient.navigate(event.notification.domain);
            visibleClient.focus();
        } else {
            event.waitUntil(
                clients.openWindow(event.notification.domain)
            );
        }
    });
});
