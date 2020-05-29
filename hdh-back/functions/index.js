const functions = require('firebase-functions');
const {app} = require('./app')
const meals = require('./meals')
const diseases = require('./diseases')

exports.v1 = functions.https.onRequest(app)
