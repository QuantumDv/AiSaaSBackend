import db from '../config/firebase.js';
import { collection, doc, setDoc, query, where, getDocs } from "firebase/firestore";
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'Fahad@2008';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    // Check if user already exists
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Save user to Firestore
    const userDoc = doc(usersRef);
    await setDoc(userDoc, {
      name,
      email,
      password,
      credits: 5, // Default credits
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    let user = null;
    querySnapshot.forEach(doc => {
      user = doc.data();
    });

    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token with user info
    const tokenPayload = {
      name: user.name,
      email: user.email,
      credits: user.credits || 0
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 hour
      sameSite: 'lax'
    });

    return res.status(200).json({ message: "Login successful", user: { name: user.name, email: user.email, credits: user.credits || 0 } });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const authStatus = (req, res) => {
  // req.user is set by authenticateToken middleware
  if (req.user) {
    return res.status(200).json({ authenticated: true, user: req.user });
  } else {
    return res.status(401).json({ authenticated: false });
  }
};

export const getCredits = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ message: "User not found" });
    }

    let user = null;
    querySnapshot.forEach(doc => {
      user = doc.data();
    });

    return res.status(200).json({ credits: user.credits || 0 });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
