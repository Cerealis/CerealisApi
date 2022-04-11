require("dotenv").config();

const express = require("express");
const app = express();
const port = 8080;

const mysql = require("mysql");
const { Sequelize } = require("sequelize");

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

// Data model for Infos
const Info = sequelize.define(
  "info", // Sequelize uses the pluralized form of the model name to search for the represented table. (infos in this case)
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

// Insert info
const addUser = async (firstname, email) => {
  // TODO : do some tests for valid email i guess ?
  await Info.create({
    firstName: firstname,
    email: email,
  }).catch((err) => {
    console.log(err);
  });
};

// Base url
app.get("/", (req, res) => {
  res.send("Cerialis API");
});

// Get all infos of all users
app.get("/getinfos", (req, res) => {
  // TODO : maybe do better code (async function)
  try {
    sequelize.authenticate();
    sequelize.query("SELECT * FROM `infos`").then(([results, metadata]) => {
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
    `Info with firstName = ${firstName} and email = ${email} inserted in ${process.env.DB_NAME}`
  );
});

// Listen configured port
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
