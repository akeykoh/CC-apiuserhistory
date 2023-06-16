const functions = require("firebase-functions");
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const serviceAccount = require('./trashcare-387803-firebase-adminsdk-hi4at-f6df30114e.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/historyuser', async (req, res) => {
  try {
    // UserId
    const userId = req.headers.userid;

    // Get data dari Firestore berdasarkan userId
    const snapshot = await db.collection('trashdispose').where('userId', '==', userId).get();
    const docs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        "Trash ID" : data.trashId,
        "Deskripsi": data.description,
        "Jumlah": data.amount,
        "Lokasi": data.location,
        "Status": data.status,
      };
    });

    if (docs.length === 0) {
      return res.status(404).json({ message: 'Tidak bisa mendapatkan data dikarenakan User ID tidak valid' });
    }

    // Mengurutkan submission berdasarkan trashId, urutan dari submission terbaru 
    docs.sort((a, b) => {
      const trashIdA = a["Trash ID"] || '';
      const trashIdB = b["Trash ID"] || '';
      return trashIdB.localeCompare(trashIdA);
    });

    res.json(docs);
  } catch (error) {
    console.error('Gagal dalam mengambil data:', error);
    res.status(500).send('Gagal dalam mengambil data');
  }
});

exports.apigetuserhistory = functions.https.onRequest(app);

// Tes di local
app.listen(3000, () => {
  console.log('Server berjalan pada port 3000');
});