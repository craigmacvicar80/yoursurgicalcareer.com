import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
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

// (Google button listener removed as requested)

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

const courses = [
    {name: "ATLS", prov: "RCSEng"}, {name: "BSS", prov: "RCSEd"}, {name: "CCrISP", prov: "RCSEng"},
    {name: "ALS", prov: "Resus Council"}, {name: "AO Trauma", prov: "AO"}, {name: "Laparoscopic Skills", prov: "Various"}
];

const webinars = [
    {name: "AI in Surgery", date: "15 Nov"}, {name: "Surgical Audit", date: "02 Dec"}, {name: "Robotics", date: "18 Jan"}
];

const specs = ["General Surgery", "Cardiothoracic", "Neurosurgery", "ENT", "Paediatric", "T&O", "Urology", "Vascular", "Plastics", "OMFS"];

// =========================================
// RENDER LOGIC (Updated with Heart Button)
// =========================================
function renderJobs(filters = {}) {
    const container = document.getElementById('job-list-container');
    if(!container) return;
    container.innerHTML = '';
    const filtered = jobListings.filter(job => {
        return (!filters.grade || job.grade === filters.grade) &&
               (!filters.spec || job.specialty === filters.spec) &&
               (!filters.region || job.location.includes(filters.region));
    });
    filtered.forEach(job => {
        const card = document.createElement('div');
        card.className = 'bg-white border rounded-lg p-5 hover:shadow-md transition-shadow';
        // NEW HTML WITH HEART BUTTON
        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div><h3 class="font-bold text-lg text-blue-700">${job.title}</h3><p class="text-sm text-gray-600">${job.location}</p></div>
                <button onclick="saveJob('${job.id}')" class="text-gray-400 hover:text-red-500 hover:fill-current transition-colors"><i data-lucide="heart" class="w-6 h-6"></i></button>
            </div>
            <span class="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">${job.grade}</span>
            <div class="grid grid-cols-3 gap-2 mb-4 text-sm">
                <div class="bg-gray-50 p-2 rounded border"><span class="block text-xs text-gray-500">Comp</span><span class="font-semibold">${job.comp}</span></div>
                <div class="bg-gray-50 p-2 rounded border"><span class="block text-xs text-gray-500">Deadline</span><span class="font-semibold text-red-600">${job.deadline}</span></div>
                <div class="bg-gray-50 p-2 rounded border"><span class="block text-xs text-gray-500">Salary</span><span class="font-semibold">${job.salary}</span></div>
            </div>
            <div class="flex gap-2"><button class="flex-1 bg-[var(--surgeon-blue)] text-white text-sm py-2 rounded">View</button></div>`;
        container.appendChild(card);
    });
}

function renderHospitals(searchTerm = "") {
    const container = document.getElementById('hosp-list');
    if(!container) return;
    container.innerHTML = '';
    const filtered = hospitalData.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.city.toLowerCase().includes(searchTerm.toLowerCase()));
    filtered.forEach(h => {
        const div = document.createElement('div');
        div.className = 'border p-4 rounded bg-white hover:shadow';
        div.innerHTML = `
            <div class="mb-2">
                <a href="${h.website}" target="_blank" class="group">
                    <h4 class="font-bold text-[var(--surgeon-blue)] group-hover:underline flex items-center gap-2">
                        ${h.name} 
                        <i data-lucide="external-link" class="w-3 h-3 text-gray-400"></i>
                    </h4>
                </a>
                <p class="text-xs text-gray-500 mb-1">${h.city}</p>
            </div>
            <div class="flex gap-1 flex-wrap mb-3">${h.specialties.map(s=>`<span class="text-[10px] bg-blue-50 px-1 rounded">${s}</span>`).join('')}</div>
            <a href="${h.wikiLink}" target="_blank" class="text-xs text-gray-500 hover:text-gray-800 hover:underline flex items-center gap-1">
                <i data-lucide="book-open" class="w-3 h-3"></i> Read on Wikipedia
            </a>
        `;
        container.appendChild(div);
    });
    if(window.lucide) window.lucide.createIcons();
}

function renderReviews(searchTerm = "") {
    const container = document.getElementById('review-list');
    if(!container) return;
    container.innerHTML = '';
    const filtered = hospitalData.filter(h => h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.city.toLowerCase().includes(searchTerm.toLowerCase()));
    filtered.forEach(h => {
        const div = document.createElement('div');
        div.className = 'border rounded-lg overflow-hidden bg-white shadow-sm';
        div.innerHTML = `<div class="bg-gray-50 p-4 border-b flex justify-between items-center"><div><h3 class="font-bold text-lg text-[var(--surgeon-blue)]">${h.name}</h3><p class="text-sm text-gray-500">${h.city}</p></div><div class="review-score">4.5</div></div><div class="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"><div><h4 class="font-bold text-gray-700">Rent</h4><p class="text-gray-600">${h.reviews.rent}</p></div><div><h4 class="font-bold text-gray-700">Transport</h4><p class="text-gray-600">${h.reviews.transport}</p></div><div><h4 class="font-bold text-gray-700">Vibe</h4><p class="text-gray-600">${h.reviews.lifestyle}</p></div></div><div class="bg-blue-50 p-3 text-sm border-t border-blue-100"><span class="font-bold text-blue-800">Verdict:</span> <span class="text-blue-900 italic">"${h.reviews.verdict}"</span></div>`;
        container.appendChild(div);
    });
}

// SETUP & LISTENERS
const cBody = document.getElementById('course-table-body');
if(cBody) courses.forEach(c => cBody.innerHTML += `<tr><td class="p-2">${c.name}</td><td>${c.prov}</td></tr>`);

const wBody = document.getElementById('webinar-table-body');
if(wBody) webinars.forEach(w => wBody.innerHTML += `<tr><td class="p-2">${w.name}</td><td>${w.date}</td></tr>`);

const specGrid = document.getElementById('spec-grid-container');
if(specGrid) specs.forEach(s => specGrid.innerHTML += `<div class="border p-4 rounded hover:shadow cursor-pointer"><h3 class="font-bold">${s}</h3></div>`);

// Attach to Window for HTML onclick
window.switchJobTab = (t) => {
    document.getElementById('job-training').classList.toggle('hidden', t !== 'training');
    document.getElementById('job-hospital').classList.toggle('hidden', t !== 'hospital');
    document.getElementById('job-reviews').classList.toggle('hidden', t !== 'reviews');
};
window.switchEventView = (t) => {
    document.getElementById('evt-list-view').classList.toggle('hidden', t !== 'list');
    document.getElementById('evt-cal-view').classList.toggle('hidden', t !== 'cal');
};

document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.content-view').forEach(c => c.classList.add('hidden'));
    document.getElementById(l.dataset.target).classList.remove('hidden');
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active', 'text-[var(--surgeon-blue)]'));
    l.classList.add('active');
}));

document.getElementById('filter-region')?.addEventListener('change', (e) => renderJobs({region: e.target.value}));
document.getElementById('hosp-search')?.addEventListener('input', (e) => renderHospitals(e.target.value));
document.getElementById('review-search')?.addEventListener('input', (e) => renderReviews(e.target.value));

// RUN INITIALIZATIONS
renderJobs();
renderHospitals();
renderReviews();

if(window.lucide) window.lucide.createIcons();

const calGrid = document.getElementById('calendar-grid');
if(calGrid) { for(let i=1; i<=30; i++) calGrid.innerHTML += `<div class="h-12 border p-1 text-xs">${i}</div>`; }

const ctx = document.getElementById('progressGauge')?.getContext('2d');
if(ctx) {
    window.gaugeChart = new Chart(ctx, {
        type: 'doughnut',
        data: { datasets: [{ data: [0, 40], backgroundColor: ['#004AAD', '#e5e7eb'], borderWidth: 0, cutout: '80%', circumference: 270, rotation: 225 }] },
        options: { plugins: { tooltip: { enabled: false } } }
    });
}
const rCtx = document.getElementById('readinessChart')?.getContext('2d');
if(rCtx) {
    new Chart(rCtx, {
        type: 'radar',
        data: { labels: ['Research', 'Lead', 'Clin', 'Teach', 'Audit'], datasets: [{ data: [6, 8, 9, 7, 5], backgroundColor: 'rgba(0, 191, 166, 0.2)', borderColor: '#00BFA6' }] },
        options: { plugins: { legend: { display: false } }, scales: { r: { ticks: { display: false } } } }
    });
}

// =========================================
// NEW SAVE JOB LOGIC
// =========================================
window.saveJob = async (jobId) => {
    if(isDemo) { alert("Please login to save jobs."); return; }
    
    // 1. Find the job details
    const jobToSave = jobListings.find(j => j.id === jobId);
    
    // 2. Save to Firebase under users -> [userID] -> savedJobs -> [jobID]
    try {
        // We use setDoc so if they click it twice, it just overwrites instead of creating duplicates
        await setDoc(doc(db, "users", user.uid, "savedJobs", jobId), jobToSave);
        alert("Job saved to your shortlist!");
    } catch(err) {
        console.error(err);
        alert("Error saving job: " + err.message);
    }
};