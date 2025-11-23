// 1. CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyBI4cPSUW12cdf1d548GjcuinYxdeL8Phk",
  authDomain: "yoursurgicalcareer.firebaseapp.com",
  projectId: "yoursurgicalcareer",
  storageBucket: "yoursurgicalcareer.firebasestorage.app",
  messagingSenderId: "194592071114",
  appId: "1:194592071114:web:b0248ae5f8aa0207e10333",
  measurementId: "G-64NTQ6C53V"
};

// 2. INITIALIZE CLASSIC FIREBASE
// We check if firebase is loaded before running
if (typeof firebase === 'undefined') {
    alert("CRITICAL ERROR: Firebase libraries failed to load from the internet. Check your connection.");
} else {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase Initialized (Classic Mode)");
}

const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null;

// 3. JOB DATA
const jobListings = [
    { id: "j1", title: "ST3 General Surgery", location: "London (NW)", grade: "ST3" },
    { id: "j2", title: "ST3 General Surgery", location: "West Midlands", grade: "ST3" },
    { id: "j3", title: "ST3 T&O", location: "Scotland", grade: "ST3" },
    { id: "j4", title: "CT1 Core Training", location: "Yorkshire", grade: "CT1" },
];

// 4. WAIT FOR PAGE LOAD
document.addEventListener("DOMContentLoaded", () => {
    
    // VISUAL TEST: PROVES CODE IS RUNNING
    console.log("System Online");

    // A. MONITOR AUTH
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            toggleScreens(true);
            document.getElementById("user-name-display").innerText = user.email;
            renderJobs();
        } else {
            currentUser = null;
            toggleScreens(false);
        }
    });

    // B. BUTTONS
    const loginBtn = document.getElementById("btn-auth-action");
    if(loginBtn) {
        loginBtn.addEventListener("click", () => {
            const email = document.getElementById("login-email").value;
            const pass = document.getElementById("login-password").value;
            
            auth.signInWithEmailAndPassword(email, pass)
                .then(() => console.log("Logged In"))
                .catch(e => alert("Login Failed: " + e.message));
        });
    }

    const guestBtn = document.getElementById("btn-skip");
    if(guestBtn) {
        guestBtn.addEventListener("click", () => {
            toggleScreens(true);
            document.getElementById("user-name-display").innerText = "Guest User";
            renderJobs();
            alert("Guest Mode Active");
        });
    }

    const logoutBtn = document.getElementById("logout-btn");
    if(logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            auth.signOut().then(() => {
                toggleScreens(false);
                alert("Logged Out");
            });
        });
    }
});

// 5. HELPER FUNCTIONS
function toggleScreens(showApp) {
    if(showApp) {
        document.getElementById("auth-container").classList.add("hidden");
        document.getElementById("app-container").classList.remove("hidden");
    } else {
        document.getElementById("auth-container").classList.remove("hidden");
        document.getElementById("app-container").classList.add("hidden");
    }
}

window.showTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
}

function renderJobs() {
    const container = document.getElementById("job-list-container");
    container.innerHTML = "";
    jobListings.forEach(job => {
        const card = document.createElement("div");
        card.className = "bg-white p-4 rounded shadow border flex justify-between";
        card.innerHTML = `
            <div>
                <h3 class="font-bold text-blue-700">${job.title}</h3>
                <p class="text-sm">${job.location}</p>
            </div>
            <button onclick="saveJob('${job.id}')" class="text-gray-400 hover:text-red-500 text-xl">❤</button>
        `;
        container.appendChild(card);
    });
}

// 6. SAVE FUNCTION (CLASSIC SYNTAX)
window.saveJob = function(jobId) {
    if (!currentUser) { alert("Please login to save."); return; }
    
    const job = jobListings.find(j => j.id === jobId);
    
    // Classic Firestore Syntax
    db.collection("users").doc(currentUser.uid).collection("savedJobs").doc(jobId).set(job)
        .then(() => alert("Job Saved!"))
        .catch((e) => alert("Error: " + e.message));
}