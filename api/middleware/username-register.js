const Auth = require("../auth/auth-model");

module.exports = async (req, res, next) => {
    const username = req.body.username;
    const user = await Auth.findBy({ username });
    if (user) {
        res.status(400).json("username taken");
    } else {
        next();
    }
};
