const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db.js");

const app = express();

const HTTP_PORT = 8000;

app.get("/", (req, res, next) => {
  res.status(200).json({ info: "Node.js, Express, and SQLite3 API" });
});

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

app.get("/api/users", db.getUsers);
app.get("/api/users/:id", db.getUserById);
app.post('/api/users/', db.createUser);
app.patch('/api/users/:id', db.updateUserById);
app.delete('/api/users/:id', db.deleteUserById);

// Default response for non created endpoints -> Always at the end
app.use(function (req, res) {
  res.status(404).json("Not found");
});

app.listen(HTTP_PORT, () => {
  console.log("Server running on port: %PORT%".replace("%PORT%", HTTP_PORT));
});
