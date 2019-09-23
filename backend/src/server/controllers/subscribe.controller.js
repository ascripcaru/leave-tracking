import _ from 'lodash';
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
        if (!_.some(userSubs.subscriptions, (el) => _.isEqual(JSON.parse(el), data))) {
            userSubs.subscriptions.push(JSON.stringify(data));
            await userSubs.save();
        }
    }

    res.status(201).json();
}
