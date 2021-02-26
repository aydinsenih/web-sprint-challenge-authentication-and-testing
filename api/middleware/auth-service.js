module.exports = (req, res, next) => {
    const user = req.body;
    const userBool = Boolean(
        user.username && user.password && typeof user.password === "string"
    );
    if (userBool) {
        next();
    } else {
        res.status(400).json("username and password required");
    }
};
