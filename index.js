const express = require("express");
const logger = require("morgan");
const app = express();
const port = 3000;
const mysql = require("mysql");

require("dotenv").config();

app.use(express.static("public"));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { verifyIdToken } = require("./firebaseAdmin.js");
app.use(verifyIdToken);

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  stringifyObjects: true,
});

console.log(process.env.DB_PASSWORD);

connection.connect((err) => {
  if (err) {
    console.log("error connecting: " + err.stack);
    return;
  }
  console.log("success");
});

app.post("/createUser", () => {
  connection.query(
    "select * from user where uid = ?",
    [req.uid],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send("error");
        return;
      }
      if (results.length) {
        res.send("ok");
        return;
      }
    }
  );
  connection.query(
    "INSERT INTO user (uid) values(?)",
    [req.uid],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send("error");
        return;
      }
      res.send("ok");
    }
  );
});
app.get("/people", (req, res) => {
  connection.query(
    "SELECT * FROM people where uid = ?",
    [req.uid],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send("error");
        return;
      }
      console.log(results);
      res.json(results);
    }
  );
});

app.post("/people", (req, res) => {
  console.log(req.body);
  const newPerson = {
    name: req.body.name,
    gender: req.body.gender,
    note: req.body.note,
    photo: req.body.photo,
    birth_date: req.body.bath_date,
    uid: req.body.uid,
  };
  connection.query(
    "INSERT INTO people (name,gender,note,photo,birth_date,uid) values(?,?,?,?,?,?)",
    [
      newPerson.name,
      newPerson.gender,
      newPerson.note,
      newPerson.photo,
      newPerson.birth_date,
      req.uid,
    ],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send("error");
        return;
      }
      res.send("ok");
    }
  );
});

app.put("/people/:id", (req, res) => {
  console.log(req.params);
  const id = req.params.id;
  console.log(req.body);
  const updatePerson = {
    name: req.body.name,
    gender: req.body.gender,
    note: req.body.note,
    photo: req.body.photo,
    birth_date: req.body.bath_date,
  };
  connection.query(
    "update people set name = ?,gender=?,note=?,photo=?,birth_date=? where id = ? and uid = ?",
    [
      updatePerson.name,
      updatePerson.gender,
      updatePerson.note,
      updatePerson.photo,
      updatePerson.birth_date,
      id,
      req.uid,
    ],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send("error");
        return;
      }
      res.send("ok");
    }
  );
});
app.delete("/people/:id", (req, res) => {
  console.log(req.params);
  const id = req.params.id;
  console.log(req.body);
  connection.query(
    "delete from people where id = ? and uid = ?",
    [id,req.uid],
    (error, results) => {
      if (error) {
        console.log(error);
        res.status(500).send("error");
        return;
      }
      res.send("ok");
    }
  );
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
