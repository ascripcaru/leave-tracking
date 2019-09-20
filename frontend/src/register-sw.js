import environment from '~/environment';

const VAPID_PUBLIC_KEY = environment.VAPID_PUBLIC_KEY;
const SUBSCRIBE_URL = `${environment.API_URL}subscribe`;

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

export function register() {
  if ('serviceWorker' in navigator) {
    Notification.requestPermission();

    navigator.serviceWorker.register('../sw.js').then(function(worker) {
      worker.pushManager.getSubscription().then(function(sub) {
        if (sub === null) {
          worker.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
          }).then(function(sub) {
            window.fetch(SUBSCRIBE_URL, {
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
              method: 'POST',
              body: JSON.stringify(sub.toJSON()),
            });
          });
        } else {
          window.fetch(SUBSCRIBE_URL, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            method: 'PUT',
            body: JSON.stringify(sub.toJSON()),
          });
        }
      });
    });
  }
}
