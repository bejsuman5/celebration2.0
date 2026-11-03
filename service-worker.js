self.addEventListener('push', function (event) {
    let data = event.data.json();
    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function (clientList) {
            if (clientList.length > 0) {
                return clientList[0].focus();
            }
            return clients.openWindow('https://bejsuman5.github.io/portfolio/');
        })
    );
});