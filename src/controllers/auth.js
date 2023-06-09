const config = require("../config/auth");
const db = require("../models");
const User = db.user;
const Role = db.role;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  user
    .save()
    .then((user) => {
      if (req.body.roles) {
        Role.find({ name: { $in: req.body.roles } })
          .then((roles) => {
            user.roles = roles.map((role) => role._id);
            user
              .save()
              .then(() => {
                res.send({ message: "User was registered successfully" });
              })
              .catch((err) => {
                res.status(500).send({ message: err });
              });
          })
          .catch((err) => {
            res.status(500).send({ message: err });
          });
      } else {
        Role.findOne({ name: "user" })
          .then((role) => {
            user.roles = [role._id];
            user
              .save()
              .then(() => {
                res.send({ message: "User was registered successfully" });
              })
              .catch((err) => {
                res.status(500).send({ message: err });
              });
          })
          .catch((err) => {
            res.status(500).send({ message: err });
          });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email
  })
  .populate("roles", "-__v")
  .exec()
  .then(user => {
    if (!user) {
      return res.status(404).send({ message: "User Not Found"});
    }

    var passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        token: null,
        message: "Invalid Password"
      });
    }

    var token = jwt.sign({id: user.id}, config.secret, {
      expiresIn: 86400 
      // ^^ 24 hours
    });

    var authorities = [];

    for (let i = 0; i < user.roles.length; i++) {
      // authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      authorities.push(user.roles[i].name);
    }

    res.status(200).send({
      id: user._id,
      username: user.username,
      email: user.email,
      roles: authorities,
      token: token
    });
  })
  .catch(err => {
    res.status(500).send({ message: err });
  });
}