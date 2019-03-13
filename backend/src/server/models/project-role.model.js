import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';

const ProjectRoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

ProjectRoleSchema.statics = {
    get(id) {
        return this.findById(id)
            .then((projectRole) => {
                if (projectRole) {
                    return projectRole;
                }
                const err = new APIError(`No such project-role with id '${id}'exists!`, httpStatus.NOT_FOUND, true);
                return Promise.reject(err);
            });
    },

    list({ skip = 0, limit = 1000, extra = {} } = {}) {
        return this.find(extra)
            .sort({ name: 1 })
            .skip(+skip)
            .limit(+limit);
    }
};

export default mongoose.model('ProjectRole', ProjectRoleSchema);
