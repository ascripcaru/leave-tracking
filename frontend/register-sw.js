const VAPID_PUBLIC_KEY = 'BNAhIy0efgOXzwYKLUrOPUfMsxOwzZhbaTb6JqMBLBt4kMEbu2CdYNL0QwquCmSjhLildkoq_ZYc5M9H4xvT1n8';
// VAPID_PUBLIC_KEY_REPLACE

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
})

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    Notification.requestPermission();

    navigator.serviceWorker.register('./sw.js').then(function(worker) {
      worker.pushManager.getSubscription().then(function(sub) {
        if (sub === null) {
          worker.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
          })
            .then(function(sub) {
              fetch('http://localhost:4040/api/subscribe', {  // API_URL_REPLACE
                headers,
                method: 'POST',
                body: JSON.stringify(sub.toJSON()),
              });
            })
        } else {
          fetch('http://localhost:4040/api/subscribe', {  // API_URL_REPLACE
            headers,
            method: 'POST',
            body: JSON.stringify(sub.toJSON()),
          });
        }
      })
    })
  });
}
