import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// YOUR KEY CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyBI4cPSUW12cdf1d548GjcuinYxdeL8Phk",
    authDomain: "yoursurgicalcareer.firebaseapp.com",
    projectId: "yoursurgicalcareer",
    storageBucket: "yoursurgicalcareer.firebasestorage.app",
    messagingSenderId: "194592071114",
    appId: "1:194592071114:web:b0248ae5f8aa0207e10333",
    measurementId: "G-64NTQ6C53V"
};

let auth, db, storage, user;
let isDemo = true;
let isSignUp = false;

// INITIALIZE FIREBASE
try {
    if(firebaseConfig.apiKey) {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        isDemo = false;
        console.log("Firebase Active");
    }
} catch(e) { console.log("Demo Mode - Config Error"); }

// AUTH LOGIC
if(!isDemo) {
    onAuthStateChanged(auth, (u) => {
        if(u) { user = u; showApp(); loadData(); }
        else { document.getElementById('auth-view').classList.remove('hidden'); document.getElementById('app-wrapper').classList.add('hidden'); }
    });
}

document.getElementById('btn-toggle-mode').addEventListener('click', () => {
    isSignUp = !isSignUp;
    const title = document.getElementById('auth-title');
    const btn = document.getElementById('btn-auth-action');
    const toggleText = document.getElementById('auth-toggle-text');
    const toggleBtn = document.getElementById('btn-toggle-mode');
    
    if (isSignUp) {
        title.textContent = "Create Account";
        btn.textContent = "Sign Up";
        toggleText.textContent = "Already have an account?";
        toggleBtn.textContent = "Sign In";
    } else {
        title.textContent = "Welcome Back";
        btn.textContent = "Sign In";
        toggleText.textContent = "New here?";
        toggleBtn.textContent = "Create an account";
    }
});

document.getElementById('btn-auth-action').addEventListener('click', async () => {
    if(isDemo) { alert("Demo Mode Active."); return; }
    const e = document.getElementById('login-email').value;
    const p = document.getElementById('login-password').value;
    try {
        if (isSignUp) await createUserWithEmailAndPassword(auth, e, p);
        else await signInWithEmailAndPassword(auth, e, p);
    } catch(err) { alert(err.message); }
});

document.getElementById('btn-skip').addEventListener('click', () => {
    isDemo = true; user = {uid:'demo'}; showApp(); renderActs([{description:'Demo Paper', points:5}]);
});

document.getElementById('btn-logout').addEventListener('click', () => {
    if(!isDemo) signOut(auth); else location.reload();
});

function showApp() {
    document.getElementById('auth-view').classList.add('hidden');
    document.getElementById('app-wrapper').classList.remove('hidden');
    if(user.email) document.getElementById('user-name').textContent = user.email;
}

// PORTFOLIO LOGIC
async function loadData() {
    if(isDemo) return;
    const snap = await getDocs(collection(db, "users", user.uid, "activities"));
    const acts = [];
    snap.forEach(d => acts.push(d.data()));
    renderActs(acts);
}

document.getElementById('btn-save-act').addEventListener('click', async () => {
    const d = document.getElementById('act-desc').value;
    const p = document.getElementById('act-pts').value;
    const file = document.getElementById('act-file').files[0];
    
    if(d && p) {
        document.getElementById('spin').classList.remove('hidden');
        let fileUrl = null;
        if(file && !isDemo) {
            try {
                const storageRef = ref(storage, `users/${user.uid}/${file.name}`);
                await uploadBytes(storageRef, file);
                fileUrl = await getDownloadURL(storageRef);
            } catch(err) { console.error("Upload failed", err); }
        }
        const act = { description: d, points: parseInt(p), fileUrl: fileUrl, date: new Date().toISOString() };
        if(!isDemo) await addDoc(collection(db, "users", user.uid, "activities"), act);
        document.getElementById('spin').classList.add('hidden');
        document.getElementById('modal-activity').classList.add('hidden');
        if(!isDemo) loadData(); else renderActs([act]);
    }
});

function renderActs(list) {
    const c = document.getElementById('activity-list');
    if (!c) return;
    let pts = 0;
    c.innerHTML = "";
    list.forEach(a => {
        pts += (a.points || 0);
        const link = a.fileUrl ? `<a href="${a.fileUrl}" target="_blank" class="text-xs text-blue-600 underline ml-2">View File</a>` : '';
        c.innerHTML += `<div class="border p-3 rounded flex justify-between"><span>${a.description} ${link}</span><span class="font-bold text-green-600">+${a.points}</span></div>`;
    });
    if(document.getElementById('stat-points')) document.getElementById('stat-points').textContent = pts;
    if(document.getElementById('stat-count')) document.getElementById('stat-count').textContent = list.length;
    if(document.getElementById('gauge-text')) document.getElementById('gauge-text').textContent = Math.round(pts/40*100)+"%";
    if(window.gaugeChart) { window.gaugeChart.data.datasets[0].data = [pts, Math.max(0, 40-pts)]; window.gaugeChart.update(); }
}

// =========================================
// UPDATED DATASETS (Now with IDs)
// =========================================
const jobListings = [
    { id: "j1", title: "ST3 General Surgery", location: "London (NW)", grade: "ST3", specialty: "General Surgery", comp: "8.2", deadline: "29 Nov 2025", salary: "£55,329" },
    { id: "j2", title: "ST3 General Surgery", location: "West Midlands", grade: "ST3", specialty: "General Surgery", comp: "6.5", deadline: "29 Nov 2025", salary: "£55,329" },
    { id: "j3", title: "ST3 T&O", location: "Scotland", grade: "ST3", specialty: "T&O", comp: "12.5", deadline: "29 Nov 2025", salary: "£55,329" },
    { id: "j4", title: "CT1 Core Training", location: "Yorkshire", grade: "CT1", specialty: "General Surgery", comp: "4.1", deadline: "05 Dec 2025", salary: "£43,923" },
    { id: "j5", title: "ST3 Urology", location: "West Midlands", grade: "ST3", specialty: "Urology", comp: "6.8", deadline: "29 Nov 2025", salary: "£55,329" },
    { id: "j6", title: "Clinical Fellow (Plastics)", location: "London (North Central)", grade: "Fellow", specialty: "Plastics", comp: "N/A", deadline: "15 Jan 2026", salary: "£55,329" },
];

const hospitalData = [
            { name: "Aberdeen Royal Infirmary", region: "Scotland", city: "Aberdeen", website: "https://www.nhsgrampian.org/", wikiLink: "https://en.wikipedia.org/wiki/Aberdeen_Royal_Infirmary", stats: ["Major Trauma", "Teaching"], reviews: { rent: "£600", transport: "Car Essential", lifestyle: "Outdoors, Surfing", verdict: "Great community." }, specialties: ["Trauma", "General"] },
            { name: "Ninewells Hospital", region: "Scotland", city: "Dundee", website: "https://www.nhstayside.scot.nhs.uk/", wikiLink: "https://en.wikipedia.org/wiki/Ninewells_Hospital", stats: ["Major Trauma", "Teaching"], reviews: { rent: "£550", transport: "Good Bus", lifestyle: "V&A, Student", verdict: "Friendly unit." }, specialties: ["Vascular", "General"] },
            { name: "Glasgow Royal Infirmary", region: "Scotland", city: "Glasgow", website: "https://www.nhsggc.scot/", wikiLink: "https://en.wikipedia.org/wiki/Glasgow_Royal_Infirmary", stats: ["Historic", "Teaching"], reviews: { rent: "£850", transport: "Subway", lifestyle: "Nightlife", verdict: "Busy, great plastics." }, specialties: ["Plastics", "General"] },
            { name: "QEUH Glasgow", region: "Scotland", city: "Glasgow", website: "https://www.nhsggc.scot/", wikiLink: "https://en.wikipedia.org/wiki/Queen_Elizabeth_University_Hospital", stats: ["Super Hospital"], reviews: { rent: "£850", transport: "Bus", lifestyle: "City", verdict: "Huge volume." }, specialties: ["Trauma", "Neuro"] },
            { name: "QEHB Birmingham", region: "West Midlands", city: "Birmingham", website: "https://www.uhb.nhs.uk/", wikiLink: "https://en.wikipedia.org/wiki/Queen_Elizabeth_Hospital_Birmingham", stats: ["L1 Trauma"], reviews: { rent: "£900", transport: "Train", lifestyle: "Diverse", verdict: "Military trauma." }, specialties: ["Trauma", "Liver"] },
            { name: "St Mary's Hospital", region: "London", city: "London", website: "https://www.imperial.nhs.uk/", wikiLink: "https://en.wikipedia.org/wiki/St_Mary%27s_Hospital,_London", stats: ["L1 Trauma"], reviews: { rent: "£2200", transport: "Tube", lifestyle: "Central", verdict: "Prestigious." }, specialties: ["Trauma", "Vascular"] },
            { name: "Manchester Royal", region: "North West", city: "Manchester", website: "https://mft.nhs.uk/", wikiLink: "https://en.wikipedia.org/wiki/Manchester_Royal_Infirmary", stats: ["Teaching"], reviews: { rent: "£1100", transport: "Tram", lifestyle: "Cool", verdict: "Solid training." }, specialties: ["Transplant"] },
            { name: "Leeds General Infirmary", region: "Yorkshire", city: "Leeds", website: "https://www.leedsth.nhs.uk/", wikiLink: "https://en.wikipedia.org/wiki/Leeds_General_Infirmary", stats: ["L1 Trauma"], reviews: { rent: "£850", transport: "Walk", lifestyle: "Friendly", verdict: "Top Neuro." }, specialties: ["Neuro", "Paeds"] },
            { name: "Southmead Hospital", region: "South West", city: "Bristol", website: "https://www.nbt.nhs.uk/", wikiLink: "https://en.wikipedia.org/wiki/Southmead_Hospital", stats: ["L1 Trauma"], reviews: { rent: "£1200", transport: "Bus", lifestyle: "Arty", verdict: "Beautiful site." }, specialties: ["Neuro", "Vascular"] }
        ];