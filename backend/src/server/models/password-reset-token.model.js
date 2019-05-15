import mongoose from 'mongoose';

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
    }
}, { timestamps: true });

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
        return this.findById(id);
    },

    list({ skip = 0, limit = 1000, extra = {} } = {}) {
        return this.find(extra)
            .sort({ createdAt: -1 })
            .skip(+skip)
            .limit(+limit);
    }
};

export default mongoose.model('PasswordResetToken', PasswordResetTokenSchema);
