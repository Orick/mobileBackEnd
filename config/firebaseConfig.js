const admin = require('firebase-admin');
const serviceAccount = require(__dirname+'/adminFirebase.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://desarrolloweb-40fd8.firebaseio.com"
});

module.exports = admin;
