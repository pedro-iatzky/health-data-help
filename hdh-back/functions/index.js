const functions = require('firebase-functions');
const express = require('express');
const app = express();
const cors = require('cors')({ origin: true });
const { check, validationResult } = require('express-validator');
const admin = require('firebase-admin');
const { v1: uuidv1 } = require('uuid');


admin.initializeApp();

// For local tests set exports GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-file.json
const db = admin.firestore();


app.use(cors);
app.use(express.json())


function verifyToken(req, res, next) {
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


app.put('/', [
  check("date", "bad date format. E.g '2020-05-15'").isISO8601(),
  check("order", "must be an integer").isInt(),
  check("mealDescription", "missing value").exists(),
  check("mealDescription", "maximum value exceeded").isLength({ max: 1024 })
], verifyToken, (req, res) => {
  // {
  //     "date": "2020-05-21",
  //     "order": 10,
  //     "mealDescription": "Rice, cheese, tomatoe. An apple, a pear."
  // }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // TODO: check order is a valid integer
  
  // Prepare and save the object in the database
  let userId = req.uid
  let docId = `${userId}-${req.body.date}-${req.body.order}`;
  let createdAt = new Date()

  let dbObject = {
    created_at: createdAt.toISOString(),
    date: req.body.date,
    meal_description: req.body.mealDescription,
    object_id: docId,
    object_uuid: uuidv1(),
    order: req.body.order,
    user_id: userId
  }
  let docRef = db.collection('dates').doc(req.body.date).collection("meals").doc(docId);
  // Update the doc if it already exists
  let setMeal = docRef.set(dbObject);

  res.json({ message: "Meal successfully saved" });
});


app.get('/dates/:date', [
  check("date", "bad date format. E.g '2020-05-15'").isISO8601(),
], verifyToken, (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // TODO: filter by user too
  let userId = req.uid
  let query = db.collection('dates').doc(req.params.date).
  collection('meals').where("user_id", "==", userId);

  query.get().then((snapshot) => {
    let date_meals = []
    snapshot.forEach((doc) => {
      date_meals.push(doc.data());
    });
    date_meals.sort((a, b) => { return a.order - b.order });
    res.json({ data: date_meals });
    return null
  })
    .catch((err) => {
      console.log('Error getting documents', err);
    });

});


exports.meals = functions.https.onRequest(app);