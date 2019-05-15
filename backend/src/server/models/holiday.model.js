import mongoose from 'mongoose';

const HolidaySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        unique: true,
    }
}, { timestamps: true });

HolidaySchema.statics = {
    get(id) {
        return this.findById(id);
    },

    list({ skip = 0, limit = 1000 } = {}) {
        return this.find()
            .sort({ date: -1 })
            .skip(+skip)
            .limit(+limit);
    }
};

export default mongoose.model('Holiday', HolidaySchema);
