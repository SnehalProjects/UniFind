const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.notifyOnNewItem = functions.firestore
  .document('items/{itemId}')
  .onCreate(async (snap, context) => {
    const newItem = snap.data();
    const posterEmail = newItem.email;

    // Get all users except the poster
    const usersSnapshot = await admin.firestore().collection('users').get();
    const tokens = [];
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      if (user.email !== posterEmail && user.fcmToken) {
        tokens.push(user.fcmToken);
      }
    });

    if (tokens.length === 0) return null;

    const payload = {
      notification: {
        title: 'New Item Posted!',
        body: `${newItem.itemName} has been posted. Check it out!`,
      },
      data: {
        itemId: context.params.itemId,
      },
    };

    // Send notification to all tokens
    return admin.messaging().sendToDevice(tokens, payload);
  }); 