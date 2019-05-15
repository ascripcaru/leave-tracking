export default function permit(...allowed) {
    const isAllowed = role => allowed.indexOf(role) > -1;

    return (req, res, next) => {
        //user type matches the permit rules or the permit list is empty
        if (req.token && (isAllowed(req.token.userType) || allowed.length == 0)) {
            next(); // role is allowed, so continue on the next middleware
        } else {
            const message = `Current: '${req.token.userType}', Requires: '${allowed}'`;
            res.status(403).json({ message });
        }
    };
}
