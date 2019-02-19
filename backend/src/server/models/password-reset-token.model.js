import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const PasswordResetTokenSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    },
    token: {
        type: String,
        default: () => random(100)
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

function random(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < len; i++) {
        let randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz, randomPoz + 1);
    }

    return randomString;
}

PasswordResetTokenSchema.statics = {
    get(id) {
        return this.findById(id)
            .then((pwdToken) => {
                if (pwdToken) {
                    return pwdToken;
                }
                const err = new APIError('No such token exists!', httpStatus.NOT_FOUND, true);
                return Promise.reject(err);
            });
    },

    list({ skip = 0, limit = 1000, extra = {} } = {}) {
        return this.find(extra)
            .sort({ createdAt: -1 })
            .skip(+skip)
            .limit(+limit);
    }
};

export default mongoose.model('PasswordResetToken', PasswordResetTokenSchema);
