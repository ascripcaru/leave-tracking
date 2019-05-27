import mongoose from 'mongoose';

// config should be imported before importing any other file
import config from './config/config';
import app from './config/express';
import {
    updateUserHolidaysForNewYear,
    unapprovedReminder,
    employmentAnniversary,
} from './scheduler/scheduler';

mongoose.Promise = global.Promise;

// connect to mongo db
const mongoUri = config.mongo.host;

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    reconnectTries: 5,
    reconnectInterval: 1000
});

mongoose.connection.on('error', () => {
    throw new Error(`unable to connect to database: ${mongoUri}`);
});

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
    // listen on port config.port
    app.listen(process.env.PORT || config.port, () => {
        updateUserHolidaysForNewYear.start();
        unapprovedReminder.start();
        employmentAnniversary.start();
        console.info(`server started on port ${config.port} (${config.env})`); // eslint-disable-line no-console
    });
}

export default app;
