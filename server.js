require('dotenv').config();

const express = require("express");
const app = express();

const cors = require("cors");

var corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const dbConfig = require("./src/config/db");
const db = require("./src/models");
const Role = db.role;

db.mongoose
  .connect(`${dbConfig.DB_URL}/${dbConfig.DB_NAME}`)
  .then(() => {
    console.log("Connected to Database Successfully");
    initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

function initial() {
  Role.estimatedDocumentCount()
    .then((count) => {
      if (count === 0) {
        new Role({
          name: "user",
        })
          .save()
          .then(() => {
            console.log("added 'user' to roles collection");
          })
          .catch((err) => {
            if (err) {
              console.log("error", err);
            }
          });

          new Role({
            name: "moderator",
          })
            .save()
            .then(() => {
              console.log("added 'moderator' to roles collection");
            })
            .catch((err) => {
              if (err) {
                console.log("error", err);
              }
            });

            new Role({
                name: "admin",
              })
                .save()
                .then(() => {
                  console.log("added 'admin' to roles collection");
                })
                .catch((err) => {
                  if (err) {
                    console.log("error", err);
                  }
                });
      }
    })
    .catch((err) => {
      console.log("error", err);
    });
}

app.get("/", (req, res) => {
  res.json({ message: "Welcome to User Auth APIs!" });
});

require("./src/routes/auth")(app);
require("./src/routes/user")(app);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
