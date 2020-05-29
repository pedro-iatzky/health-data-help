const { v1: uuidv1 } = require('uuid');
const { check, validationResult } = require('express-validator');

const { app, db, verifyToken } = require('./app')


app.get('/diseases/dates/:date', [
  check("date", "bad date format. E.g '2020-05-15'").isISO8601(),
], verifyToken, (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // let userId = req.uid
  let userId = req.uid

  // First, get all of the user tracked diseases
  let userDocRef = db.collection('users').doc(userId);

  userDocRef.get().then((snapshot) => {
    let response = []
    if (snapshot.exists) {
      let trackedDiseases = snapshot.data().diseases ? (snapshot.data().diseases) : []

      // Then, check which one has descriptions for the given date
      let queryDiseasesDate = db.collection('dates').doc(req.params.date).
        collection('diseases').where("user_id", "==", userId);
      queryDiseasesDate.get().then((snapshot) => {
        let dateDiseases = {}
        snapshot.forEach((doc) => {
          let disease = doc.data().disease
          if (disease) {
            dateDiseases[disease] = doc.data();
          }
        });

        // Once I get both lists, I will only return the data for the trackedDiseases
        trackedDiseases.forEach((d) => {
          let diseaseDescription = ""
          if (dateDiseases[d]) {
            diseaseDescription = dateDiseases[d].disease_description
          }
          let diseaseResponse = {
            disease: d,
            diseaseDescription: diseaseDescription ? diseaseDescription : ""
          }
          response.push(diseaseResponse)
        })
        res.json({ data: response });
      })
        .catch((err) => {
          console.log('Error executing queryDiseasesDate', err);
        });
    } else {
      // If the snapshot does'n exist, we want to return an empty response 
      res.json({ data: response });
    }

  }
  ).catch((err) => {
    console.log('Error getting userDocRef documents', err);
  });
  return null

});


app.put('/diseases/selected', [
  check("diseases", "missing value").exists(),
  check("diseases", "diseases must be an array").isArray()
], verifyToken, (req, res) => {
  // {
  //     "diseases": ["Acne", "fatigue"]
  // }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // TODO: check no more than 3 diseases
  // TODO: check diseases are among the available options

  // Prepare and save the object in the database
  let userId = req.uid
  let updatedAt = new Date()

  let dbObject = {
    diseases: req.body.diseases,
    updated_at: updatedAt.toISOString(),
    user_id: userId,
  }
  let docRef = db.collection('users').doc(userId);
  // Update the doc if it already exists
  let updateUserDoc = docRef.update(dbObject).then(() => {
    res.json({ message: "Diseases succesfully saved" });
  }).catch((err) => {
    //  The document does not exist, so create it
    docRef.set(dbObject)
    res.json({ message: "Diseases succesfully saved" });
  }
  );


});


app.put('/diseases', [
  check("date", "bad date format. E.g '2020-05-15'").isISO8601(),
  check("disease", "missing value").exists(),
  check("disease", "maximum value exceeded").isLength({ max: 1024 }),
  check("diseaseDescription", "missing value").exists(),
  check("diseaseDescription", "maximum value exceeded").isLength({ max: 1024 })
], verifyToken, (req, res) => {
  // {
  //     "date": "2020-05-21",
  //     "disease": "Fatigue",
  //     "diseaseDescription": "Two new red bumps in the nose"
  // }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Prepare and save the object in the database
  let userId = req.uid
  let currentDt = new Date()

  // TODO: check date is valid. (e.g. not after today)

  let docRef = null
  // Check if there is a disease description for that disease already
  let queryDiseasesDate = db.collection('dates').doc(req.body.date).
    collection('diseases').where("user_id", "==", userId);
  queryDiseasesDate.get().then((snapshot) => {
    snapshot.forEach((doc) => {
      let disease = doc.data().disease
      if (disease === req.body.disease) {
        docRef = doc.ref
      }
    });

    // If doc was already in database, update it
    if (docRef) {
      console.log("updating")
      let dbObject = {
        updatedAt: currentDt.toISOString(),
        disease_description: req.body.diseaseDescription,
      }
      docRef.update(dbObject)
    }
    else {
      let dbObject = {
        created_at: currentDt.toISOString(),
        date: req.body.date,
        disease: req.body.disease,
        disease_description: req.body.diseaseDescription,
        object_uuid: uuidv1(),
        user_id: userId
      }

      let docRef = db.collection('dates').doc(req.body.date).
        collection("diseases").doc();
      let setDisease = docRef.set(dbObject);
    }

    res.json({ message: "Disease successfully saved" });
  });
});

