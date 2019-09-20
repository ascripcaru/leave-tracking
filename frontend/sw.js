self.addEventListener('push', function(e) {
    const options = {
        icon: 'issco-logo.png',
        vibrate: [50, 50],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: Date.now(),
        }
    };

    const text = e.data.json()

    if (self.Notification.permission == 'granted') {
        e.waitUntil(
            self.registration.showNotification(text.altceva, Object.assign({ body: text.user }, options))
        )
    }
});
