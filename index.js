require("dotenv").config();

const express = require("express");
const app = express();
const port = 8080;

const mysql = require("mysql");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: "mysql",
    host: process.env.DB_HOST,
  }
);

app.get("/", (req, res) => {
  res.send("Api ok !");
});

app.get("/getinfos", (req, res) => {
  try {
    sequelize.authenticate();
    sequelize.query("SELECT * FROM `infos`").then(([results, metadata]) => {
      res.send(results);
    });
  } catch (error) {
    console.error("Error at line selection : ", error);
    res.send(error);
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
