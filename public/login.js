import {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "./firebase.js";

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("user-email").value;
  const password = document.getElementById("user-pass").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    location.href = "/index.html";
  } catch (error) {
    const errorMessage = error.message;
    alert("Error: " + errorMessage);
  }
});

document.getElementById("sign-up-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("sign-up-email").value;
  const password = document.getElementById("sign-up-user-pass").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    location.href = "/index.html";
  } catch (error) {
    const errorMessage = error.message;
    alert("Error: " + errorMessage);
  }
});
