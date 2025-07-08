import db from '../config/firebase.js';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

export const deductCreditsAfterCaption = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch user
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ message: "User not found" });
    }

    let userDocRef, userData;
    querySnapshot.forEach(docSnap => {
      userDocRef = docSnap.ref;
      userData = docSnap.data();
    });

    if (userData.credits < 2) {
      return res.status(403).json({ message: "Not enough credits" });
    }

    // Deduct 2 credits
    await updateDoc(userDocRef, { credits: userData.credits - 2 });

    return res.status(200).json({ credits: userData.credits - 2 });
  } catch (error) {
    console.error("Error deducting credits:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}; 