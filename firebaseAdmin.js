const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const serviceAccount = require("./serviceAccountKey.json");

initializeApp({ credential: cert(serviceAccount) });

const verifyIdToken = async (req, _, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s/g, "");
  console.log(token);
  if (token) {
    const user = await getAuth().verifyIdToken(token);
    req.uid = user.uid;
    req.email = user.email;
  }
  next();
};

exports.verifyIdToken = verifyIdToken;
