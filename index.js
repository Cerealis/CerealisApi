require("dotenv").config();

const express = require("express");
var cors = require("cors");
const app = express();
const port = 8080;

const mysql = require("mysql");
const { Sequelize } = require("sequelize");

app.use(cors());

// Declare sql infos
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: "mysql",
    host: process.env.DB_HOST,
  }
);

console.log(process.env.DB_NAME);

// Data model for Users
const User = sequelize.define(
  "user", // Sequelize uses the pluralized form of the model name to search for the represented table. (users in this case)
  {
    firstName: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: false,
  }
);

// Insert user
const addUser = async (firstname, email) => {
  // TODO : do some tests for valid email i guess ?
  await User.create({
    firstName: firstname,
    email: email,
  }).catch((err) => {
    console.log(err);
  });
};

// Delete user
const deleteUser = async (id) => {
  await User.destroy({ where: { id: id } }).catch((err) => {
    console.log(err);
  });
};

// Base url
app.get("/", (req, res) => {
  res.send("Cerealis API");
});

// Get all users
app.get("/getusers", (req, res) => {
  // TODO : maybe do better code (async function)
  try {
    sequelize.authenticate();
    sequelize.query("SELECT * FROM `users`").then(([results, metadata]) => {
      console.log(results);
      res.send(results);
    });
  } catch (error) {
    console.error("Error at line selection : ", error);
    res.send(error);
  }
});

// Add user to database
app.get("/adduser", function (req, res) {
  const firstName = req.query.firstName;
  const email = req.query.email;

  addUser(firstName, email);

  res.send(
    `User with firstName = ${firstName} and email = ${email} inserted in ${process.env.DB_NAME}`
  );
});

// Delete user to database
app.get("/deleteuser", function (req, res) {
  const id = req.query.id;

  deleteUser(id);

  res.send(`User successfully deleted in ${process.env.DB_NAME}`);
});

// Listen configured port
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
