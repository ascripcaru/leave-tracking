import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../../config/config';
import User from '../models/user.model';
import { handlePasswordReset } from '../../worker/userWorker';
import PasswordResetTokenSchema from '../models/password-reset-token.model';

async function login(req, res, next) {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user == null) {
        return res.status(401).json({ message: 'Bad credentials.' });
    }

    const dbHash = user.password;

    const match = await bcrypt.compare(password, dbHash);

    if (!match) {
        return res.status(401).json({ message: 'Bad credentials.' });
    }

    const token = jwt.sign({ id: user.id, userType: user.userType }, config.jwtSecret, { issuer: config.jwtIssuer });

    res.json({ token });
}

function me(req, res) {
    return User.get(req.token.id).then(user => {
        user = user.toObject();
        delete user.password;

        return res.json(user);
    });
}

async function recover(req, res) {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
        return res.json();
    }

    let safeUser = user.toObject();
    delete safeUser.password;

    // query for unused tokens for the given user id
    const notUsedTokenQuery = {
        userId: safeUser._id,
        used: false
    };

    // mark previously not used tokens as invalid before we generate a new one
    await PasswordResetTokenSchema.update(notUsedTokenQuery, { used: true }, { multi: true });

    const resetToken = new PasswordResetTokenSchema({
        userId: safeUser._id,
        used: false
    });

    const savedToken = await resetToken.save();

    const data = { user: safeUser, token: savedToken.toObject() };

    handlePasswordReset(data);

    res.json();
}

async function reset(req, res, next) {
    const { password, confirmPassword, token } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const dbToken = await PasswordResetTokenSchema.findOne({ token });

    if (!dbToken) {
        return res.status(400).json({ message: 'Invalid token.' });
    }

    if (dbToken.used) {
        return res.status(400).json({ message: 'Token was already used.' });
    }

    const { userId } = dbToken;
    const user = await User.findOne({ _id: userId });

    if (!user) {
        return res.status(400).json({ message: 'User linked to token does not exist.' });
    }

    user.password = bcrypt.hashSync(password, 10);
    await user.save();

    dbToken.used = true;
    await dbToken.save();

    res.json();
}

export default { login, me, recover, reset };
