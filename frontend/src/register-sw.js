const VAPID_PUBLIC_KEY = 'VAPID_PUBLIC_KEY_REPLACE';

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const headers = new Headers({
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

function registerSW() {
  if ('serviceWorker' in navigator) {
    Notification.requestPermission();

    navigator.serviceWorker.register('../sw.js').then(function(worker) {
      worker.pushManager.getSubscription().then(function(sub) {
        if (sub === null) {
          worker.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
          }).then(function(sub) {
            fetch('API_URL_REPLACE/subscribe', {
              headers,
              method: 'POST',
              body: JSON.stringify(sub.toJSON()),
            });
          });
        } else {
          fetch('API_URL_REPLACE/subscribe', {
            headers,
            method: 'PUT',
            body: JSON.stringify(sub.toJSON()),
          });
        }
      });
    });
  }
}

registerSW();
