import mongoose from 'mongoose';

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
        return this.findById(id);
    },

    list({ skip = 0, limit = 1000, extra = {} } = {}) {
        return this.find(extra)
            .sort({ name: 1 })
            .skip(+skip)
            .limit(+limit);
    }
};

export default mongoose.model('ProjectRole', ProjectRoleSchema);
