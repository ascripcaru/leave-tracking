import webpush from 'web-push';

const {
    FE_DOMAIN,
    GCM_API_KEY,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
} = process.env;

webpush.setGCMAPIKey(GCM_API_KEY);
webpush.setVapidDetails(FE_DOMAIN, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export function sendNotification(subscription, payload) {
    webpush.sendNotification(subscription, payload);
}
