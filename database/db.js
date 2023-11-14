const sqlite3 = require("sqlite3").verbose();
const md5 = require("md5");

const DBSOURCE = "./database/db.db";

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    throw err;
  } else {
    console.log("conected to SQLite database");

    db.all("SELECT * FROM users", (err, rows) => {
      if (err) {
        initialCommand()
      }
    });

    
}
});

function initialCommand () {
    
    db.run(`CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            CONSTRAINT email_unique UNIQUE (email)
        )`,
      (err) => {
        if (err) {
            console.log('>>> ERROR CREATING TABLE', err);
          throw err;
        } else {
            console.log('>>> Table users created');
          const insert =
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
          db.run(insert, ["admin", "admin@example.com", md5("admin123456")]);
          db.run(insert, ["user", "user@example.com", md5("user123456")]);
        }
      });
};

const getUsers = (req, res) => {
  const query = "SELECT * FROM users";
  const params = [];
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(404).json(err.message);
      throw err;
    }
    res.status(200).json({
      message: "success",
      data: rows,
    });
  });
};

const getUserById = (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM users WHERE id = ?';
    const params = [id];
    db.get(query, params, (err, rows) => {
        if (err) {
            res.status(404).json({
                error: err.message,
            });
            throw err;
        } else {
            res.status(200).json({
                message: 'success', 
                data: rows
            })
        }
    })
};

const createUser = (req, res, next) => {
    const errors = [];
    (!!!req.body.name && errors.push('No name specified'));
    (!!!req.body.email && errors.push('No email specified'));
    (!!!req.body.password && errors.push('No password specified'));
    if (!!errors.length) {
        res.status(400).json({error: errors.join(',')});
        return;
    }
    const { name: bodyName, email: bodyEmail, password: bodyPassword } = req.body;
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    const data = {
        name: bodyName, 
        email: bodyEmail, 
        password: md5(bodyPassword),
    };
    const params = [bodyName, bodyEmail, data.password];
    db.run(query, params, function(err, result) {
        if (err) {
            res.status(400).json({error: err.message});
        } else {
            res.status(201).json({
                message: 'success', 
                data: data, 
                id: this.lastID,
            })
        }
    })
}
const updateUserById = (req, res, next) => {
    const query = `UPDATE users SET 
    name = COALESCE(?,name),
    email = COALESCE(?,email),
    password = COALESCE(?,password)
    WHERE id = ?`;
    const { id } = req.params
    const {email, name, password} = req.body;
    const data = {
        name: name, 
        email: email, 
        password: password ? md5(password) : null,
    }
    const params = [data.name, data.email, data.password, id];
    db.run(query, params, function(err, results){
        if (err) {
            res.status(400).json({error: err.message});
            return;
        } 
        res.status(200).json({
            message: 'success', 
            data: data, 
            changes: this.changes,
        })
    });
};
const deleteUserById = (req, res, next) => {
    const query = 'DELETE FROM users WHERE id = ?';
    const { id } = req.params;
    db.run(query, [id], function(err, results) {
        if (err) {
            res.status(400).json({error: err.message});
            return;
        }
        res.status(200).json({message: 'User deleted', changes: this.changes})
    } )
}



module.exports = { getUsers, getUserById, createUser, updateUserById, deleteUserById };
