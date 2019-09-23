import webpush from 'web-push';
import User from './server/models/user.model';
import Subscription from './server/models/subscription.model';

const {
    FE_DOMAIN,
    GCM_API_KEY,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
} = process.env;

webpush.setGCMAPIKey(GCM_API_KEY);
webpush.setVapidDetails(FE_DOMAIN, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export function sendNotification(subscription, payload) {
    return webpush.sendNotification(subscription, JSON.stringify(payload));
}

export async function sendNotificationForEmails(emails, payload) {
    const userIds = await User.find({ email: { $in: emails } })
        .then(users => users.map(user => user._id));

    const subscriptions = await Subscription.find({ user: { $in: userIds } })

    for (let userSub of subscriptions) {
        userSub.subscriptions.forEach(async el => {
            await webpush.sendNotification(JSON.parse(el), JSON.stringify(payload));
        });
    }
}
