const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.user?.roles) return res.status(401).json({ responseCode: "UNAUTHORIZED", message: 'Unauthorized' }); // Unauthorized
        const rolesArray = [...allowedRoles];
        const result = req.user.roles.map(role => rolesArray.includes(role)).find(val => val === true);
        if (!result) return res.status(401).json({ responseCode: "UNAUTHORIZED", message: 'Unauthorized' });;
        next();
    }
};

module.exports = verifyRoles;