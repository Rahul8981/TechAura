// app.js

// --- Global State ---
let currentUser = null;

// --- UI Helpers ---
const showToast = (message) => {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
};

// --- Routing Engine ---
const routes = {
    home: renderHome,
    login: renderLogin,
    studentDashboard: renderStudentDashboard,
    adminDashboard: renderAdminDashboard,
    industryDashboard: renderIndustryDashboard,
    institutionDashboard: renderInstitutionDashboard
};

function navigate(route) {
    const root = document.getElementById('app-root');
    root.innerHTML = '<div class="flex justify-center items-center h-[60vh]"><i class="fa-solid fa-spinner fa-spin text-4xl text-indigo-500"></i></div>';
    
    // Update Navbar based on Auth
    const navAuth = document.getElementById('nav-auth-buttons');
    if (currentUser) {
        navAuth.innerHTML = `<button class="clay-btn bg-red-500" onclick="logout()">Logout</button>`;
    } else {
        navAuth.innerHTML = `
            <button class="font-bold text-indigo-600 px-4 py-2" onclick="navigate('login')">Login</button>
            <button class="clay-btn" onclick="navigate('login')">Get Started</button>
        `;
    }

    setTimeout(() => {
        window.scrollTo(0, 0);
        routes[route]();
    }, 400); // Smooth transition fake delay
}

function logout() {
    currentUser = null;
    showToast("Logged out successfully");
    navigate('home');
}

// --- Views ---

function renderHome() {
    const html = `
        <div class="max-w-7xl mx-auto px-6 py-12 slide-up">
            <!-- Hero Section -->
            <div class="text-center mt-10">
                <span class="px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm mb-6 inline-block">SIH26044 Prototype</span>
                <h1 class="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight">
                    Bridge the Gap Between <br/> <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Education and Industry</span>
                </h1>
                <p class="mt-6 text-xl text-slate-600 max-w-3xl mx-auto">
                    Build the right skills, discover verified opportunities, connect with industry, and accelerate your career through Smart Automation.
                </p>
                <div class="mt-10 flex justify-center gap-4">
                    <button class="clay-btn text-lg" onclick="navigate('login')">Get Started <i class="fa-solid fa-arrow-right ml-2"></i></button>
                </div>
            </div>

            <!-- Animated Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
                ${statCard('Students', '1,250+', 'fa-users')}
                ${statCard('Industry Partners', '80+', 'fa-building')}
                ${statCard('Opportunities', '150+', 'fa-briefcase')}
                ${statCard('Placement Rate', '78%', 'fa-chart-line')}
            </div>

            <!-- Workflow Steps -->
            <div class="mt-32" id="how-it-works">
                <h2 class="text-4xl font-bold text-center mb-16">How TechAura Works</h2>
                <div class="grid md:grid-cols-3 gap-8">
                    ${stepCard('01', 'Registration', 'Join based on your role.', 'fa-user-plus')}
                    ${stepCard('02', 'Skill Profiling', 'Identify technical & soft skills.', 'fa-list-check')}
                    ${stepCard('03', 'AI Match Engine', 'Algorithmic career matching.', 'fa-brain')}
                    ${stepCard('04', 'Apply & Track', 'Direct MoU-backed applications.', 'fa-paper-plane')}
                    ${stepCard('05', 'Skill-Gap Analysis', 'Find missing courses.', 'fa-magnifying-glass-chart')}
                    ${stepCard('06', 'Placement Analytics', 'NEP/NIRF ready reports.', 'fa-chart-pie')}
                </div>
            </div>
        </div>
    `;
    document.getElementById('app-root').innerHTML = html;
}

function renderLogin() {
    document.getElementById('app-root').innerHTML = `
        <div class="min-h-[80vh] flex items-center justify-center fade-in px-4">
            <div class="clay-card w-full max-w-md p-8">
                <h2 class="text-3xl font-bold text-center mb-6">Welcome Back</h2>
                <p class="text-center text-sm text-slate-500 mb-6">Use DEMO credentials provided below.</p>
                
                <input type="email" id="email" class="clay-input" placeholder="Email Address" value="student@techaura.demo">
                <input type="password" id="password" class="clay-input" placeholder="Password" value="Student@123">
                
                <button class="clay-btn w-full mt-4" onclick="handleLogin()">Login to Dashboard</button>

                <div class="mt-8 clay-card-inner text-sm text-slate-600">
                    <p class="font-bold mb-2">Demo Accounts:</p>
                    <ul class="space-y-1">
                        <li><b>Student:</b> student@techaura.demo</li>
                        <li><b>Institution:</b> institution@techaura.demo</li>
                        <li><b>Industry:</b> company@techaura.demo</li>
                        <li><b>Admin:</b> admin@techaura.demo</li>
                        <li class="mt-2 text-xs italic">Password: Any containing "123"</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
            currentUser = data.user;
            showToast(`Welcome, ${currentUser.name}`);
            
            if(currentUser.role === 'student') navigate('studentDashboard');
            if(currentUser.role === 'admin') navigate('adminDashboard');
            if(currentUser.role === 'industry') navigate('industryDashboard');
            if(currentUser.role === 'institution') navigate('institutionDashboard');
        } else {
            alert("Invalid Demo Credentials");
        }
    } catch (err) {
        showToast("Error connecting to server. Attempting local mock login.");
        // Fallback for strict frontend-only environments if API fails
        if(email.includes('student')) { currentUser = {role:'student', name:'Aarav (Local)'}; navigate('studentDashboard'); }
    }
}

// --- Student Dashboard ---
function renderStudentDashboard() {
    document.getElementById('app-root').innerHTML = `
        <div class="max-w-7xl mx-auto px-6 py-8 slide-up flex flex-col md:flex-row gap-8">
            <!-- Sidebar -->
            <div class="w-full md:w-64 space-y-4">
                <div class="clay-card text-center">
                    <div class="w-20 h-20 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center text-indigo-600 text-3xl font-bold">
                        A
                    </div>
                    <h3 class="font-bold text-xl">${currentUser.name}</h3>
                    <p class="text-sm text-slate-500">B.Tech Computer Science</p>
                </div>
                <div class="clay-card p-4 space-y-2 font-semibold text-slate-700">
                    <div class="p-3 bg-indigo-50 text-indigo-600 rounded-xl cursor-pointer"><i class="fa-solid fa-border-all w-6"></i> Dashboard</div>
                    <div class="p-3 hover:bg-white rounded-xl cursor-pointer transition"><i class="fa-solid fa-list-check w-6"></i> Skill Profiling</div>
                    <div class="p-3 hover:bg-white rounded-xl cursor-pointer transition"><i class="fa-solid fa-briefcase w-6"></i> Recommended Jobs</div>
                    <div class="p-3 hover:bg-white rounded-xl cursor-pointer transition"><i class="fa-solid fa-certificate w-6"></i> Certificates</div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="flex-1 space-y-8">
                <!-- Overview Stats -->
                <div class="grid grid-cols-3 gap-6">
                    <div class="clay-card text-center">
                        <div class="text-4xl font-black text-indigo-600 mb-2">85%</div>
                        <p class="text-sm font-bold text-slate-500">Profile Completion</p>
                    </div>
                    <div class="clay-card text-center">
                        <div class="text-4xl font-black text-cyan-500 mb-2">78%</div>
                        <p class="text-sm font-bold text-slate-500">Skill Score</p>
                    </div>
                    <div class="clay-card text-center">
                        <div class="text-4xl font-black text-green-500 mb-2">72%</div>
                        <p class="text-sm font-bold text-slate-500">Placement Readiness</p>
                    </div>
                </div>

                <!-- Skill Gap Analysis -->
                <div class="clay-card">
                    <h3 class="text-2xl font-bold mb-6">Skill Gap Analysis & Match</h3>
                    <div class="flex flex-col md:flex-row items-center gap-8">
                        <div class="match-ring" style="--percentage: 84;">
                            <span>84%</span>
                        </div>
                        <div class="flex-1 w-full">
                            <h4 class="font-bold text-lg mb-2">Match: Software Developer Intern @ TechNova</h4>
                            <div class="clay-card-inner mb-3 flex gap-2 flex-wrap">
                                <span class="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full"><i class="fa-solid fa-check"></i> Java</span>
                                <span class="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full"><i class="fa-solid fa-check"></i> SQL</span>
                                <span class="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full"><i class="fa-solid fa-check"></i> HTML/CSS</span>
                            </div>
                            <h4 class="font-bold text-sm text-red-500 mb-2">Missing Skills to Improve:</h4>
                            <div class="clay-card-inner flex gap-2 flex-wrap">
                                <span class="text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full"><i class="fa-solid fa-xmark"></i> Spring Boot</span>
                                <span class="text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full"><i class="fa-solid fa-xmark"></i> REST APIs</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Job Opportunities -->
                <h3 class="text-2xl font-bold mt-10">AI Recommended Opportunities</h3>
                <div class="space-y-4" id="job-list">
                    <div class="p-6 text-center text-slate-500">Loading jobs...</div>
                </div>
            </div>
        </div>
    `;

    // Fetch and render jobs
    fetchJobs();
}

async function fetchJobs() {
    try {
        const res = await fetch('/api/opportunities');
        const data = await res.json();
        
        const jobHTML = data.data.map(job => `
            <div class="clay-card flex justify-between items-center hover:-translate-y-1 transition">
                <div>
                    <span class="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded mb-2 inline-block">${job.type}</span>
                    <h4 class="text-lg font-bold text-slate-800">${job.title}</h4>
                    <p class="text-sm text-slate-500"><i class="fa-regular fa-building mr-1"></i> ${job.company} • ${job.location}</p>
                    <p class="text-sm font-semibold text-green-600 mt-2">${job.stipend}</p>
                </div>
                <div class="text-right flex flex-col items-end gap-3">
                    <div class="bg-indigo-50 text-indigo-600 font-bold px-3 py-1 rounded-full text-sm">Demo Match: ~80%</div>
                    <button class="clay-btn py-2 px-6" onclick="applyJob()">Apply Now</button>
                </div>
            </div>
        `).join('');
        document.getElementById('job-list').innerHTML = jobHTML;
    } catch(e) {
        document.getElementById('job-list').innerHTML = `<div class="clay-card text-center text-red-500">Please start local backend index.js or view demo data.</div>`;
    }
}

function applyJob() {
    showToast("Application submitted successfully!");
}

// --- Admin Dashboard (Reporting & Analytics) ---
function renderAdminDashboard() {
    document.getElementById('app-root').innerHTML = `
        <div class="max-w-7xl mx-auto px-6 py-8 slide-up">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-3xl font-bold text-slate-800">Platform Admin & Reports</h2>
                <button class="clay-btn clay-btn-secondary"><i class="fa-solid fa-file-pdf mr-2"></i> Export NEP/NIRF Report</button>
            </div>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                ${statCard('Total Students', '1,250', 'fa-users', 'bg-blue-100 text-blue-600')}
                ${statCard('Institutions', '45', 'fa-school', 'bg-purple-100 text-purple-600')}
                ${statCard('Companies', '80', 'fa-building', 'bg-orange-100 text-orange-600')}
                ${statCard('Placements', '620', 'fa-award', 'bg-green-100 text-green-600')}
            </div>

            <div class="grid md:grid-cols-2 gap-8">
                <div class="clay-card">
                    <h3 class="text-xl font-bold mb-4">Placement Conversion Trend</h3>
                    <canvas id="placementChart" height="200"></canvas>
                </div>
                <div class="clay-card">
                    <h3 class="text-xl font-bold mb-4">Skill Gap Closure Rate</h3>
                    <canvas id="skillChart" height="200"></canvas>
                </div>
            </div>
        </div>
    `;

    setTimeout(renderCharts, 100);
}

// --- Helper Functions for UI ---
function statCard(title, value, icon, colorClass = "bg-indigo-100 text-indigo-600") {
    return `
        <div class="clay-card text-center">
            <div class="w-14 h-14 ${colorClass} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div class="text-3xl font-black text-slate-800 mb-1">${value}</div>
            <div class="text-sm font-semibold text-slate-500">${title}</div>
        </div>
    `;
}

function stepCard(number, title, desc, icon) {
    return `
        <div class="clay-card relative hover:-translate-y-2 transition-transform duration-300">
            <div class="absolute -top-6 -left-6 text-6xl font-black text-slate-200 opacity-50 z-0">${number}</div>
            <div class="relative z-10">
                <div class="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center text-xl mb-4 shadow-sm">
                    <i class="fa-solid ${icon}"></i>
                </div>
                <h3 class="text-xl font-bold mb-2 text-slate-800">${title}</h3>
                <p class="text-slate-600">${desc}</p>
            </div>
        </div>
    `;
}

// --- Chart Rendering ---
function renderCharts() {
    const ctx1 = document.getElementById('placementChart');
    if(ctx1) {
        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['2023', '2024', '2025', '2026'],
                datasets: [{
                    label: 'Placed Students',
                    data: [300, 450, 520, 620],
                    backgroundColor: '#4f46e5',
                    borderRadius: 8
                }]
            },
            options: { responsive: true, plugins: { legend: { display: false } } }
        });
    }

    const ctx2 = document.getElementById('skillChart');
    if(ctx2) {
        new Chart(ctx2, {
            type: 'line',
            data: {
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [{
                    label: 'Skill Match %',
                    data: [60, 65, 75, 84],
                    borderColor: '#06b6d4',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(6, 182, 212, 0.2)'
                }]
            },
            options: { responsive: true }
        });
    }
}

// --- Placeholder Roles ---
function renderIndustryDashboard() {
    document.getElementById('app-root').innerHTML = `
        <div class="max-w-7xl mx-auto px-6 py-8 slide-up">
            <h2 class="text-3xl font-bold mb-8">Industry Partner: Talent Search</h2>
            <div class="clay-card mb-8">
                <div class="flex gap-4">
                    <input type="text" class="clay-input m-0 flex-1" placeholder="Search by skill (e.g. React, Java)...">
                    <button class="clay-btn">Search AI Matches</button>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${studentCard('Aarav Sharma', 'Java, SQL, React', '82%')}
                ${studentCard('Priya Nair', 'Python, Data Analytics', '88%')}
                ${studentCard('Rohan Sen', 'Node.js, MongoDB', '76%')}
            </div>
        </div>
    `;
}

function studentCard(name, skills, match) {
    return `
        <div class="clay-card text-center">
            <div class="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 border-2 border-indigo-500"></div>
            <h3 class="font-bold text-lg">${name}</h3>
            <p class="text-sm text-slate-500 mb-4">${skills}</p>
            <div class="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full text-sm inline-block mb-4">Placement Ready: ${match}</div>
            <button class="clay-btn w-full py-2 text-sm">Shortlist</button>
        </div>
    `;
}

function renderInstitutionDashboard() {
    renderAdminDashboard(); // Mirrors admin UI for prototype purposes
}

// Init Application
navigate('home');
