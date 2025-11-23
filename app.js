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

// 2. INITIALIZE FIREBASE (Classic Mode)
if (typeof firebase === 'undefined') {
    console.error("Firebase not loaded. Check internet connection.");
} else {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
let currentUser = null;

// 3. FULL DATASET
const jobListings = [
    { id: "j1", title: "ST3 General Surgery", location: "London (NW)", grade: "ST3", specialty: "General Surgery", comp: "8.2", deadline: "29 Nov 2025", salary: "£55,329" },
    { id: "j2", title: "ST3 General Surgery", location: "West Midlands", grade: "ST3", specialty: "General Surgery", comp: "6.5", deadline: "29 Nov 2025", salary: "£55,329" },
    { id: "j3", title: "ST3 T&O", location: "Scotland", grade: "ST3", specialty: "T&O", comp: "12.5", deadline: "29 Nov 2025", salary: "£55,329" },
    { id: "j4", title: "CT1 Core Training", location: "Yorkshire", grade: "CT1", specialty: "General Surgery", comp: "4.1", deadline: "05 Dec 2025", salary: "£43,923" },
    { id: "j5", title: "ST3 Urology", location: "West Midlands", grade: "ST3", specialty: "Urology", comp: "6.8", deadline: "29 Nov 2025", salary: "£55,329" },
    { id: "j6", title: "Clinical Fellow (Plastics)", location: "London (North Central)", grade: "Fellow", specialty: "Plastics", comp: "N/A", deadline: "15 Jan 2026", salary: "£55,329" },
];

// 4. MAIN APP LOGIC
document.addEventListener("DOMContentLoaded", () => {
    console.log("App Starting...");

    // A. MONITOR AUTH STATE
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

    // B. CONNECT BUTTONS
    // Login
    const loginBtn = document.getElementById("btn-auth-action");
    if(loginBtn) {
        loginBtn.addEventListener("click", () => {
            const email = document.getElementById("login-email").value;
            const pass = document.getElementById("login-password").value;
            
            // Visual Feedback
            loginBtn.innerText = "Signing in...";
            
            auth.signInWithEmailAndPassword(email, pass)
                .then(() => {
                     console.log("Logged In");
                     loginBtn.innerText = "Sign In";
                })
                .catch(e => {
                    alert("Login Failed: " + e.message);
                    loginBtn.innerText = "Sign In";
                });
        });
    }

    // Guest Mode
    const guestBtn = document.getElementById("btn-skip");
    if(guestBtn) {
        guestBtn.addEventListener("click", () => {
            toggleScreens(true);
            document.getElementById("user-name-display").innerText = "Guest User";
            renderJobs();
        });
    }

    // Logout
    const logoutBtn = document.getElementById("logout-btn");
    if(logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            auth.signOut().then(() => {
                toggleScreens(false);
                window.location.reload(); // Refresh to clear state
            });
        });
    }
});

// 5. RENDER FUNCTIONS
function toggleScreens(showApp) {
    if(showApp) {
        document.getElementById("auth-container").classList.add("hidden");
        document.getElementById("app-container").classList.remove("hidden");
    } else {
        document.getElementById("auth-container").classList.remove("hidden");
        document.getElementById("app-container").classList.add("hidden");
    }
}

// Global Tab Switcher
window.showTab = function(tabId) {
    // Hide all
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    // Show target
    document.getElementById(tabId).classList.remove('hidden');
    
    // Update Sidebar Active State
    document.querySelectorAll('aside nav a').forEach(el => {
        el.classList.remove('bg-blue-800', 'text-white', 'shadow-sm');
        el.classList.add('text-blue-100', 'hover:bg-white/10');
    });
    
    // Highlight Active
    const activeLink = document.querySelector(`aside nav a[onclick="showTab('${tabId}')"]`);
    if(activeLink) {
        activeLink.classList.remove('text-blue-100', 'hover:bg-white/10');
        activeLink.classList.add('bg-blue-800', 'text-white', 'shadow-sm');
    }
}

// Render Job Cards (Rich UI)
function renderJobs() {
    const container = document.getElementById("job-list-container");
    container.innerHTML = "";
    
    jobListings.forEach(job => {
        const card = document.createElement("div");
        card.className = "bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group";
        
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div>
                    <h3 class="font-bold text-lg text-[var(--surgeon-blue)] group-hover:text-blue-600 transition-colors">${job.title}</h3>
                    <p class="text-sm text-gray-500 flex items-center gap-1 mt-1"><i data-lucide="map-pin" class="w-3 h-3"></i> ${job.location}</p>
                </div>
                <button onclick="saveJob('${job.id}')" class="text-gray-300 hover:text-red-500 hover:fill-current transition-all transform hover:scale-110">
                    <i data-lucide="heart" class="w-6 h-6"></i>
                </button>
            </div>
            
            <div class="flex flex-wrap gap-2 mb-4">
                <span class="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-100">${job.grade}</span>
                <span class="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md border border-green-100">${job.salary}</span>
            </div>

            <div class="grid grid-cols-2 gap-2 mb-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>
                    <span class="block text-[10px] text-gray-400 uppercase font-bold">Competition</span>
                    <span class="font-semibold text-gray-700">${job.comp}</span>
                </div>
                <div class="text-right">
                    <span class="block text-[10px] text-gray-400 uppercase font-bold">Deadline</span>
                    <span class="font-bold text-red-600">${job.deadline}</span>
                </div>
            </div>
            
            <button class="w-full bg-white border border-gray-200 text-gray-600 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all">
                View Details
            </button>
        `;
        container.appendChild(card);
    });
    
    // Re-initialize icons for the new cards
    lucide.createIcons();
}

// 6. SAVE JOB LOGIC
window.saveJob = function(jobId) {
    if (!currentUser) { alert("Please login to save."); return; }
    
    const job = jobListings.find(j => j.id === jobId);
    
    db.collection("users").doc(currentUser.uid).collection("savedJobs").doc(jobId).set(job)
        .then(() => alert("Job Saved to Dashboard!"))
        .catch((e) => alert("Error: " + e.message));
}