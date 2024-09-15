

// ########## Room Key Generation

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters[randomIndex];
  }

  return result;
}


// ########### Database Connection


const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'rooms'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = db;


// ########### Update the 'id' variable


var id;

db.query('SELECT MAX(id) AS maxId FROM roomkeys', (error, results) => {
  if (error) throw error;
  const newId = (results[0].maxId || 0) + 1;
  id = newId;
  console.log('Id initialized as : ' + id);
});

// ########### Admin Password Hashing

var crypto = require('crypto');
const adminpass = 'imnottellingyou';
var adminpassword = crypto.createHash('sha256').update(adminpass).digest('hex');

// ########### Accual API


var express = require('express');
var app = express();

// ########### /croom endpoint


var crntroom = '';

app.get('/croom',
    (req, res) => {
      crntroom = generateRandomString(10);
      time = Math.floor(Date.now());
      const qr = 'INSERT INTO roomkeys (id, roomkey, timestamp) VALUES (?, ?, ?)';
      db.query(qr, [id, crntroom, time], (err, results) => {
        if (err) {
          console.error('Error executing query:', err);
        }
        console.log('Room added successfully. Key : ' + crntroom);
      });
      res.status(200).send({
        roomkey: crntroom,
        timestamp: time,
        roomid: id
      });

      id++;
    });


// ########### /join/?id endpoint


app.post('/join/:key', (req, res) => {
  const { key } = req.params;
  const qr = 'SELECT COUNT(*) AS count FROM roomkeys WHERE roomkey = ?';
  db.query(qr, [key], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send({ joined: 'False', roomkey: key });
    }
    const keyExists = results[0].count > 0;
    if (!keyExists) {
      console.log('Cant find the key in Database')
      res.status(404).send({ joined: 'False', roomkey: key });
    }
    else if (keyExists) {
      console.log('Join successfull, key : ' + key);
      res.status(200).send({ joined: 'True', roomkey: key });
    }
  });
});
module.exports = app;


// ########### /admin/login/?login endpoint


app.get('/admin/login/:login' , (req, res) => {
  var login = req.params.login;
  var hash = crypto.createHash('sha256').update(login).digest('hex');
  if (hash == adminpassword)
  {
    console.log('Logged in successfully');
    res.status(200).send({Match: 'True'});
  }
  else
  {
    console.log('Hash did not match, tried hash : ' + hash);
    res.status(300).send({Match: 'False'});
  }
})
