import Subscription from '../models/subscription.model';

export async function saveSubscription(req, res) {
    const userId = req.token.id;
    const data = req.body;

    const userSubs = await Subscription.findOne({ user: userId });

    if (!userSubs) {
        const sub = new Subscription({
            user: userId,
            subscriptions: [JSON.stringify(data)],
        });
        await sub.save();
    } else {
        const sub = JSON.stringify(data);
        if (!sub in userSubs.subscriptions) {
            userSubs.subscriptions.push(sub);
            await userSubs.save();
        }
    }

    res.status(201).json();
}
