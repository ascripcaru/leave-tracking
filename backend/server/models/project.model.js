import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const ProjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    approvers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    description: {
        type: String,
        required: true
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProjectRole',
        required: true
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
    }
});

ProjectSchema.statics = {
    get(id) {
        return this.findById(id)
            .populate('approvers')
            .populate('roles')
            .then((project) => {
                if (project) {
                    return project;
                }
                const err = new APIError('No such project exists!', httpStatus.NOT_FOUND, true);
                return Promise.reject(err);
            });
    },

    list({ skip = 0, limit = 50 } = {}) {
        return this.find()
            .populate('approvers')
            .populate('roles')
            .sort({ active: -1, name: 1 })
            .skip(+skip)
            .limit(+limit)
            .exec();
    }
};

export default mongoose.model('Project', ProjectSchema);
