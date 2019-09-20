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

    if (self.Notification.permission == 'granted') {
        event.waitUntil(
            self.registration.showNotification(payload.title, Object.assign({ body: payload.body }, options))
        )
    }
});
