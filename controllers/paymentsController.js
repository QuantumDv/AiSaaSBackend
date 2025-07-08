import db from '../config/firebase.js';
import { collection, addDoc, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
export const upload = multer({ storage: storage });

export const uploadPaymentProof = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    // Accept credits from req.body (should be sent from frontend)
    const credits = req.body.credits ? parseInt(req.body.credits, 10) : 0;
    await addDoc(collection(db, "payments"), {
      userEmail,
      fileUrl,
      uploadedAt: new Date().toISOString(),
      credits,
      status: "pending"
    });
    return res.status(200).json({ message: "Payment proof uploaded" });
  } catch (error) {
    console.error("Error uploading payment proof:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const paymentsRef = collection(db, 'payments');
    const snapshot = await getDocs(paymentsRef);
    const payments = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }));
    return res.status(200).json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const releaseCredits = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const paymentDocRef = doc(db, 'payments', paymentId);
    // Get payment document
    const paymentSnap = await getDocs(collection(db, 'payments'));
    let paymentData = null;
    paymentSnap.forEach(docSnap => {
      if (docSnap.id === paymentId) {
        paymentData = docSnap.data();
      }
    });
    if (!paymentData) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    if (paymentData.status === 'released') {
      return res.status(400).json({ message: 'Already released' });
    }
    // Update payment status
    await updateDoc(paymentDocRef, { status: 'released' });
    // Increment user credits
    const userEmail = paymentData.userEmail;
    const creditsToAdd = paymentData.credits || 0;
    if (userEmail && creditsToAdd > 0) {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', userEmail));
      const userSnap = await getDocs(q);
      if (!userSnap.empty) {
        const updatePromises = [];
        userSnap.forEach((userDoc) => {
          const userDocRef = userDoc.ref;
          const userData = userDoc.data();
          const newCredits = (userData.credits || 0) + creditsToAdd;
          console.log(`Updating credits for user ${userEmail}: ${userData.credits} -> ${newCredits}`);
          updatePromises.push(updateDoc(userDocRef, { credits: newCredits }));
        });
        await Promise.all(updatePromises);
        console.log(`Credits updated for user ${userEmail}`);
      } else {
        console.log(`User not found for email: ${userEmail}`);
      }
    } else {
      console.log(`No credits to add or userEmail missing. userEmail: ${userEmail}, creditsToAdd: ${creditsToAdd}`);
    }
    return res.status(200).json({ message: 'Credits released and user credited' });
  } catch (error) {
    console.error('Error releasing credits:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 