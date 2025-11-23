// 1. IMPORTS (Updated to include 'doc' and 'setDoc')
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. CONFIGURATION (PASTE YOUR KEYS HERE)
const firebaseConfig = {
    apiKey: "AIzaSyBI4cPSUW12cdf1d548GjcuinYxdeL8Phk",
  authDomain: "yoursurgicalcareer.firebaseapp.com",
  projectId: "yoursurgicalcareer",
  storageBucket: "yoursurgicalcareer.firebasestorage.app",
  messagingSenderId: "194592071114",
  appId: "1:194592071114:web:b0248ae5f8aa0207e10333",
  measurementId: "G-64NTQ6C53V",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// 3. INITIALIZE FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global Variables
let currentUser = null; 
const isDemo = false; // Set to true if you want to bypass login for testing

// 4. DATASETS (With IDs added)
const jobListings = [
    { id: "j1", title: "ST3 General Surgery", location: "London (NW)", grade: "ST3", specialty: "General Surgery", comp: "8.2", deadline: "29 Nov 2025", salary: "£55,329" },
    { id: "j2", title: "ST3 General Surgery", location: "West Midlands", grade: "ST3", specialty: "General Surgery", comp: "6.5", deadline: "29 Nov 2025", salary: "£55,329" },
    { id: "j3", title: "ST3 T&O", location: "Scotland", grade: "ST3", specialty: "T&O", comp: "12.5", deadline: "29 Nov 2025", salary: "£55,329" },
    { id: "j4", title: "CT1 Core Training", location: "Yorkshire", grade: "CT1", specialty: "General Surgery", comp: "4.1", deadline: "05 Dec 2025", salary: "£43,923" },
    { id: "j5", title: "ST3 Urology", location: "West Midlands", grade: "ST3", specialty: "Urology", comp: "6.8", deadline: "29 Nov 2025", salary: "£55,329" },
    { id: "j6", title: "Clinical Fellow (Plastics)", location: "London (North Central)", grade: "Fellow", specialty: "Plastics", comp: "N/A", deadline: "15 Jan 2026", salary: "£55,329" },
];

// 5. AUTHENTICATION LOGIC
// Monitor Login State
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        currentUser = user;
        console.log("User logged in:", user.email);
        document.getElementById("auth-container").classList.add("hidden");
        document.getElementById("app-container").classList.remove("hidden");
        updateDashboard(user);
    } else {
        // User is signed out
        currentUser = null;
        console.log("User logged out");
        document.getElementById("auth-container").classList.remove("hidden");
        document.getElementById("app-container").classList.add("hidden");
    }
});

// Login Function
const loginBtn = document.getElementById("login-btn");
if(loginBtn) {
    loginBtn.addEventListener("click", () => {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                console.log("Login successful");
            })
            .catch((error) => {
                alert("Error: " + error.message);
            });
    });
}

// Signup Function
const signupBtn = document.getElementById("signup-btn");
if(signupBtn) {
    signupBtn.addEventListener("click", () => {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert("Account created! You are now logged in.");
            })
            .catch((error) => {
                alert("Error: " + error.message);
            });
    });
}

// Logout Function
const logoutBtn = document.getElementById("logout-btn");
if(logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        signOut(auth).then(() => {
            alert("Logged out successfully");
        });
    });
}

// 6. UI LOGIC (Tabs & Rendering)
function updateDashboard(user) {
    document.getElementById("user-name-display").innerText = user.email;
    renderJobs();
}

// Tab Switching
window.showTab = (tabId) => {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    // Show selected
    document.getElementById(tabId).classList.remove('hidden');
    
    // Update sidebar styling
    document.querySelectorAll('aside nav a').forEach(el => {
        el.classList.remove('bg-blue-800', 'text-white');
        el.classList.add('text-blue-100');
    });
    const activeLink = document.querySelector(`aside nav a[onclick="showTab('${tabId}')"]`);
    if(activeLink) {
        activeLink.classList.remove('text-blue-100');
        activeLink.classList.add('bg-blue-800', 'text-white');
    }
};

// Render Jobs List
function renderJobs() {
    const container = document.getElementById("job-list-container");
    if(!container) return;
    
    container.innerHTML = "";
    
    jobListings.forEach(job => {
        const card = document.createElement("div");
        card.className = "bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow";
        
        // This includes the new HEART button with the saveJob function attached
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h3 class="font-bold text-lg text-blue-700">${job.title}</h3>
                    <p class="text-sm text-gray-600">${job.location}</p>
                </div>
                <button onclick="saveJob('${job.id}')" class="text-gray-400 hover:text-red-500 hover:fill-current transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5 4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </button>
            </div>
            <span class="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">${job.grade}</span>
            <div class="grid grid-cols-3 gap-2 mb-4 text-sm">
                <div class="bg-gray-50 p-2 rounded border"><span class="block text-xs text-gray-500">Comp</span><span class="font-semibold">${job.comp}</span></div>
                <div class="bg-gray-50 p-2 rounded border"><span class="block text-xs text-gray-500">Deadline</span><span class="font-semibold text-red-600">${job.deadline}</span></div>
                <div class="bg-gray-50 p-2 rounded border"><span class="block text-xs text-gray-500">Salary</span><span class="font-semibold">${job.salary}</span></div>
            </div>
            <div class="flex gap-2"><button class="flex-1 bg-[#1e3a8a] text-white text-sm py-2 rounded">View</button></div>
        `;
        container.appendChild(card);
    });
}

// 7. SAVE JOB FUNCTIONALITY
// Attached to window so the HTML button can see it
window.saveJob = async (jobId) => {
    if (!currentUser) { 
        alert("Please login to save jobs."); 
        return; 
    }
    
    // Find the job details
    const jobToSave = jobListings.find(j => j.id === jobId);
    
    // Save to Firestore: users -> [userID] -> savedJobs -> [jobID]
    try {
        await setDoc(doc(db, "users", currentUser.uid, "savedJobs", jobId), jobToSave);
        alert("Job saved to your shortlist!");
    } catch(err) {
        console.error("Error saving job:", err);
        alert("Error saving job: " + err.message);
    }
};