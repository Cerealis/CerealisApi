// index.js

const expect = require("chai").expect;
const express = require("express");
const request = require("supertest");

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
      .expect(200, function (err, res) {
        if (err) {
          return done(err);
        }
        callStatus = res.body.message;
        expect(callStatus).to.equal("Cerialis API ok");
        // Done
        done();
      });
  });

  it("sould send back a joel mdr", function (done) {
    request(app)
      .get("/getinfos")
      .expect(200, function (err, res) {
        if (err) {
          return done(err);
        }
        callStatus = res.body;
        expect(callStatus).to.equal("Cerialis API ok");
        // Done
        done();
      });
  });
});
