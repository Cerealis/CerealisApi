// index.js
const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const expect = require("chai").expect;
const express = require("express");
const request = require("supertest");

const mysql = require("mysql");
const { Sequelize } = require("sequelize");

let lastId = null;

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

// Delete info
const deleteUser = async (id) => {
  await Info.destroy({ where: { id: id } }).catch((err) => {
    console.log(err);
  });
};

const createApp = () => {
  app = express();

  const router = express.Router();

  app.get("/", (req, res) => {
    res.send({ message: "Cerialis API ok" });
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

  // Delete user to database
  app.get("/deleteuser", function (req, res) {
    const id = req.query.id;

    deleteUser(id);

    res.send(`User successfully deleted in ${process.env.DB_NAME}`);
  });

  app.use(router);

  return app;
};

describe("Cerialis API", function () {
  let app;

  // Called once before any of the tests in this block begin.
  before(function (done) {
    app = createApp();
    app.listen(function (err) {
      if (err) {
        return done(err);
      }
      done();
    });
  });

  it("should send back a JSON object with message set to Cerialis API ok", function (done) {
    request(app)
      .get("/")
      .set("Content-Type", "application/json")
      .expect(200, function (err, res) {
        if (err) {
          return done(err);
        }
        callStatus = res.body.message;
        expect(callStatus).to.equal("Cerialis API ok");
        // Done

        lastId = 12;
        done();
      });
  });

  it("sould create a user named testUser, with email 'test.user@test.fr'", function (done) {
    request(app)
      .get("/adduser")
      .set("Content-Type", "application/json")
      .query({ firstName: "testUser", email: "test.user@test.fr" })
      .expect(200, function (err, res) {
        if (err) {
          return done(err);
        }

        sequelize
          .query("SELECT `id` FROM `infos` WHERE `firstname` = 'testUser'`")
          .then(([results, metadata]) => {
            lastId = results;
          });

        done();
      });
  });

  it("should get the last user", function (done) {
    request(app)
      .get("/getinfos")
      .set("Content-Type", "application/json")
      .expect(200, function (err, res) {
        if (err) {
          return done(err);
        }
        callStatus = res.body[res.body.length - 1];
        lastId = callStatus.id;
        expect(callStatus.firstname).to.equal("testUser");
        // Done
        done();
      });
  });

  it("should delete the last user", function (done) {
    request(app)
      .get("/deleteuser")
      .set("Content-Type", "application/json")
      .query({ id: lastId })
      .expect(200, function (err, res) {
        if (err) {
          return done(err);
        }
        done();
      });
  });
});
