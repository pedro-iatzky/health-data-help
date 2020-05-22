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


app.put('/', [
  check("date", "bad date format. E.g '2020-05-15'").isISO8601(),
  check("order", "must be an integer").isInt(),
  check("mealDescription", "missing value").exists(),
  check("mealDescription", "maximum value exceeded").isLength({ max: 1024 })
], (req, res) => {
  // {
  //     "date": "2020-05-21",
  //     "order": 10,
  //     "mealDescription": "Rice, cheese, tomatoe. An apple, a pear."
  // }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  console.log(req.body);


  // TODO: get user_id from authorization header
  // TODO: check order is a valid integer

  // Prepare and save the object in the database
  let userId = "user_id"
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
  let docRef = db.collection('meals').doc(docId);
  let setMeal = docRef.set(dbObject);

  res.json({ message: "Meal successfully saved" });
});


app.get('/dates/:date', [
  check("date", "bad date format. E.g '2020-05-15'").isISO8601(),
], (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // TODO: filter by user too
  let query = db.collection('meals').where("date", "==", req.params.date);

  query.get().then((snapshot) => {
    let date_meals = []
    snapshot.forEach((doc) => {
      date_meals.push(doc.data());
    });
    date_meals.sort((a, b) => { return a.order - b.order });
    res.json({ data: date_meals });
  })
    .catch((err) => {
      console.log('Error getting documents', err);
    });

});


exports.meals = functions.https.onRequest(app);