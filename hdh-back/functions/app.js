const express = require('express');
const app = express();
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');


admin.initializeApp();

// For local tests set exports GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-file.json
const db = admin.firestore();


app.use(cors);
app.use(express.json())

exports.app = app
exports.db = db

exports.verifyToken = function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ');
    if (bearer.length !== 2) {
      res.sendStatus(403);
    }
    const bearerToken = bearer[1];
    let idToken = bearerToken;
    // idToken comes from the client app
    admin.auth().verifyIdToken(idToken)
      .then(function (decodedToken) {
        req.uid = decodedToken.uid;
        next()
        return null
      }).catch(function (error) {
        res.sendStatus(403)
      });
  } else {
    res.sendStatus(403);
  }
}
