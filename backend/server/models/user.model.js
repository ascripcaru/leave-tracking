import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const UserSchema = new mongoose.Schema({
    startDate: {
        type: Date,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    holidays: {
        type: Number,
        required: true
    },
    taken: {
        type: Number,
        default: 0
    },
    pending: {
        type: Number,
        default: 0
    },
    daysPerYear: {
        type: Number,
        default: 0
    },
    projectRoles: [{
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProjectRole',
            required: true
        }
    }],
    userType: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toObject: {
        transform(doc, ret) {
            delete ret.password;
            ret.fullName = `${ret.firstName} ${ret.lastName}`;
            return ret;
        }
    }
});

UserSchema.statics = {
    get(id) {
        return this.findById(id)
            .populate('projectRoles.project')
            .populate('projectRoles.role')
            .then((user) => {
                if (user) {
                    return user;
                }
                const err = new APIError('No such user exists!', httpStatus.NOT_FOUND, true);
                return Promise.reject(err);
            });
    },

    list({ skip = 0, limit = 1000, extra = {} } = {}) {
        return this.find(extra)
            .populate('projectRoles.project')
            .populate('projectRoles.role')
            .sort({ createdAt: -1 })
            .skip(+skip)
            .limit(+limit);
    }
};

export default mongoose.model('User', UserSchema);
