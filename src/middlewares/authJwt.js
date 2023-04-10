const jwt = require('jsonwebtoken');
const config = require("../config/auth");
const db = require('../models');
const User = db.user;
const Role = db.role;

verifyToken = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
        return res.status(403).send({ message: "No token provided!" })
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!"});
        }
        req.userId = decoded.id;
        next();
    });
};

isAdmin = (req, res, next) => {
    User.findById(req.userId).exec()
    .then((user) => {
        Role.find({ _id: { $in: user.roles }}).exec()
        .then((roles) => {
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "admin") {
                    next();
                    return;
                }
            }
            res.status(403).send({ message: "Requires Admin Role "});
        })
        .catch((err) => {
            res.status(500).send({ message: err });
        });
    })
    .catch((err) => {
        res.status(500).send({ message: err });
    });
}

isModerator = (req, res, next) => {
    User.findById(req.userId).exec()
    .then((user) => {
        Role.find({ _id: { $in: user.roles }}).exec()
        .then((roles) => {
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].name === "moderator") {
                    next();
                    return;
                }
            }
            res.status(403).send({ message: "Requires Moderator Role "});
        })
        .catch((err) => {
            res.status(500).send({ message: err });
        });
    })
    .catch((err) => {
        res.status(500).send({ message: err });
    });
}

const authJwt = {
    verifyToken,
    isAdmin,
    isModerator
};

module.exports = authJwt;