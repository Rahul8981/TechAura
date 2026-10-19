let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let authToken = localStorage.getItem('token') || null;

async function apiCall(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);
    try {
        const response = await fetch(endpoint, config);
        return await response.json();
    } catch(e) {
        return { success: false, message: "Network error. Check DB connection." };
    }
}

const showToast = (message, isError = false) => {
    const toast = document.getElementById('toast');
    toast.querySelector('i').className = isError ? "fa-solid fa-circle-xmark text-red-500 text-xl" : "fa-solid fa-circle-check text-green-500 text-xl";
    document.getElementById('toast-msg').innerText = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
};

function navigate(route) {
    document.getElementById('app-root').innerHTML = '<div class="flex justify-center items-center h-[60vh]"><i class="fa-solid fa-spinner fa-spin text-5xl text-indigo-500"></i></div>';
    
    const navAuth = document.getElementById('nav-auth-buttons');
    if (currentUser && authToken) {
        navAuth.innerHTML = `<button class="font-bold text-slate-600 mr-4 hidden md:inline"><i class="fa-regular fa-user mr-2"></i>${currentUser.name}</button><button class="clay-btn bg-red-500 shadow-red-500/30 hover:bg-red-600" onclick="logout()">Logout</button>`;
    } else {
        navAuth.innerHTML = `<button class="font-bold text-indigo-600 px-4 py-2" onclick="navigate('login')">Login</button><button class="clay-btn" onclick="navigate('register')">Register</button>`;
    }

    setTimeout(() => {
        window.scrollTo(0, 0);
        window[route]();
    }, 150); 
}

function logout() {
    currentUser = null; authToken = null;
    localStorage.clear();
    showToast("Logged out successfully");
    navigate('home');
}

// ======================= VIEWS ======================= //

function home() {
    document.getElementById('app-root').innerHTML = `
        <div class="max-w-7xl mx-auto px-6 py-12 slide-up">
            <div class="text-center mt-10">
                <span class="px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm mb-6 inline-block">SIH26044 Fully Working</span>
                <h1 class="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight">
                    Bridge the Gap Between <br/> <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Education and Industry</span>
                </h1>
                <p class="mt-6 text-xl text-slate-600 max-w-3xl mx-auto">Real Database. Real Authentication. Real Dashboards.</p>
                <div class="mt-10 flex justify-center gap-4">
                    ${currentUser ? 
                        `<button class="clay-btn text-lg" onclick="navigate('${currentUser.role}Dashboard')">Go to Dashboard <i class="fa-solid fa-arrow-right ml-2"></i></button>` : 
                        `<button class="clay-btn text-lg" onclick="navigate('register')">Create Account <i class="fa-solid fa-arrow-right ml-2"></i></button>`
                    }
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
                <div class="clay-card text-center"><i class="fa-solid fa-brain text-4xl text-cyan-500 mb-4"></i><h3 class="font-bold text-xl mb-2">AI Skill Matching</h3><p class="text-slate-500">Algorithms map student skills against industry demands.</p></div>
                <div class="clay-card text-center"><i class="fa-solid fa-briefcase text-4xl text-indigo-500 mb-4"></i><h3 class="font-bold text-xl mb-2">Direct Internships</h3><p class="text-slate-500">Industry partners post jobs and shortlist candidates.</p></div>
                <div class="clay-card text-center"><i class="fa-solid fa-chart-pie text-4xl text-green-500 mb-4"></i><h3 class="font-bold text-xl mb-2">Placement Analytics</h3><p class="text-slate-500">Real-time stats for Institutions and Admins.</p></div>
            </div>
        </div>
    `;
}

function register() {
    document.getElementById('app-root').innerHTML = `
        <div class="min-h-[70vh] flex items-center justify-center slide-up px-4">
            <div class="clay-card w-full max-w-md p-8">
                <h2 class="text-3xl font-bold text-center mb-6">Create Account</h2>
                <input type="text" id="rName" class="clay-input" placeholder="Full Name or Company Name">
                <input type="email" id="rEmail" class="clay-input" placeholder="Email Address">
                <input type="password" id="rPass" class="clay-input" placeholder="Password">
                <select id="rRole" class="clay-input cursor-pointer text-slate-600">
                    <option value="student">I am a Student</option>
                    <option value="industry">I am an Industry Partner</option>
                    <option value="institution">I am an Institution</option>
                    <option value="admin">I am a Platform Admin</option>
                </select>
                <button class="clay-btn w-full mt-4" onclick="doRegister()">Register Now</button>
                <p class="text-center mt-6 text-sm font-semibold text-slate-500 cursor-pointer hover:text-indigo-600" onclick="navigate('login')">Already have an account? Login</p>
            </div>
        </div>
    `;
}

async function doRegister() {
    const name = document.getElementById('rName').value;
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPass').value;
    const role = document.getElementById('rRole').value;
    if(!name || !email || !password) return showToast("All fields required", true);
    
    const data = await apiCall('/api/auth/register', 'POST', {name, email, password, role});
    if(data.success) {
        localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user; authToken = data.token;
        showToast("Account Created!"); navigate(`${role}Dashboard`);
    } else showToast(data.message, true);
}

function login() {
    document.getElementById('app-root').innerHTML = `
        <div class="min-h-[70vh] flex items-center justify-center slide-up px-4">
            <div class="clay-card w-full max-w-md p-8">
                <h2 class="text-3xl font-bold text-center mb-6">Welcome Back</h2>
                <input type="email" id="lEmail" class="clay-input" placeholder="Email Address">
                <input type="password" id="lPass" class="clay-input" placeholder="Password">
                <button class="clay-btn w-full mt-4" onclick="doLogin()">Secure Login</button>
                <p class="text-center mt-6 text-sm font-semibold text-slate-500 cursor-pointer hover:text-indigo-600" onclick="navigate('register')">Don't have an account? Register</p>
            </div>
        </div>
    `;
}

async function doLogin() {
    const email = document.getElementById('lEmail').value;
    const password = document.getElementById('lPass').value;
    if(!email || !password) return showToast("All fields required", true);
    
    const data = await apiCall('/api/auth/login', 'POST', {email, password});
    if(data.success) {
        localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user; authToken = data.token;
        showToast(`Welcome, ${currentUser.name}`); navigate(`${currentUser.role}Dashboard`);
    } else showToast(data.message, true);
}

// === DASHBOARDS === //

async function studentDashboard() {
    if(!authToken) return navigate('login');
    document.getElementById('app-root').innerHTML = `
        <div class="max-w-7xl mx-auto px-6 py-8 slide-up flex flex-col md:flex-row gap-8">
            <div class="w-full md:w-64"><div class="clay-card text-center"><div class="w-20 h-20 bg-indigo-100 rounded-full mx-auto mb-4 flex items-center justify-center text-indigo-600 text-3xl font-bold">${currentUser.name.charAt(0)}</div><h3 class="font-bold text-xl">${currentUser.name}</h3><p class="text-sm text-slate-500 mb-4">Student Portal</p><div class="clay-card-inner text-xs text-left"><p class="font-bold mb-1">My System Skills:</p>React, Node.js, HTML, CSS</div></div></div>
            <div class="flex-1 space-y-6"><h2 class="text-3xl font-bold">Live AI Recommended Jobs</h2><div id="job-list" class="space-y-4"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</div></div>
        </div>
    `;
    const data = await apiCall('/api/opportunities');
    if (data.success && data.data.length > 0) {
        document.getElementById('job-list').innerHTML = data.data.map(j => `
            <div class="clay-card flex justify-between items-center"><div class="flex-1"><span class="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded inline-block mb-2">${j.type}</span><h4 class="text-xl font-bold">${j.title}</h4><p class="text-sm text-slate-500 mb-2"><i class="fa-solid fa-building mr-1"></i> ${j.company} • ${j.location}</p><p class="text-xs font-semibold bg-slate-100 px-2 py-1 rounded inline-block">Req: ${j.requiredSkills.join(', ')}</p></div><button class="clay-btn" onclick="applyJob('${j._id}')">1-Click Apply</button></div>
        `).join('');
    } else document.getElementById('job-list').innerHTML = `<p class="text-slate-500 font-semibold">No opportunities currently posted. Ask an Industry account to post one!</p>`;
}

async function applyJob(id) {
    const data = await apiCall('/api/apply', 'POST', { opportunityId: id });
    if(data.success) showToast(`Applied! AI Match Score: ${data.matchScore}%`);
    else showToast(data.message, true);
}

function industryDashboard() {
    if(!authToken) return navigate('login');
    document.getElementById('app-root').innerHTML = `
        <div class="max-w-7xl mx-auto px-6 py-8 slide-up">
            <h2 class="text-3xl font-bold mb-6">Industry Portal: ${currentUser.name}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="clay-card">
                    <h3 class="text-xl font-bold mb-4">Post Opportunity</h3>
                    <input type="text" id="jTitle" class="clay-input" placeholder="Job Title (e.g. Frontend Dev)">
                    <select id="jType" class="clay-input"><option value="Job">Full-time</option><option value="Internship">Internship</option></select>
                    <input type="text" id="jLoc" class="clay-input" placeholder="Location (e.g. Remote)">
                    <input type="text" id="jSkills" class="clay-input" placeholder="Required Skills (comma separated)">
                    <button class="clay-btn w-full" onclick="postJob()">Publish</button>
                </div>
                <div class="clay-card"><h3 class="text-xl font-bold mb-4">My Active Posts</h3><div id="my-jobs" class="space-y-3">Loading...</div></div>
            </div>
        </div>
    `;
    loadIndustryJobs();
}

async function postJob() {
    const title = document.getElementById('jTitle').value, type = document.getElementById('jType').value, location = document.getElementById('jLoc').value, skills = document.getElementById('jSkills').value.split(',').map(s=>s.trim());
    if(!title || !skills[0]) return showToast("Title and skills required", true);
    const res = await apiCall('/api/opportunities', 'POST', {title, company: currentUser.name, type, location, requiredSkills: skills});
    if(res.success) { showToast("Posted successfully!"); loadIndustryJobs(); } else showToast(res.message, true);
}

async function loadIndustryJobs() {
    const res = await apiCall('/api/opportunities');
    if(res.success && res.data.length > 0) {
        document.getElementById('my-jobs').innerHTML = res.data.filter(j => j.company === currentUser.name).map(j => `<div class="clay-card-inner"><h4 class="font-bold">${j.title}</h4><p class="text-xs text-slate-500">${j.type} • ${j.location}</p></div>`).join('');
    } else document.getElementById('my-jobs').innerHTML = "No posts yet.";
}

function adminDashboard() { loadStats('Platform Admin'); }
function institutionDashboard() { loadStats('Institution'); }

async function loadStats(roleName) {
    if(!authToken) return navigate('login');
    document.getElementById('app-root').innerHTML = `
        <div class="max-w-7xl mx-auto px-6 py-8 slide-up">
            <h2 class="text-3xl font-bold mb-8">${roleName} Analytics Dashboard</h2>
            <div id="stats-grid" class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10"><i class="fa-solid fa-spinner fa-spin text-3xl text-indigo-500"></i></div>
            <div class="clay-card"><h3 class="text-xl font-bold mb-4">Platform Overview</h3><canvas id="statChart" height="80"></canvas></div>
        </div>
    `;
    const res = await apiCall('/api/admin/stats');
    if(res.success) {
        const d = res.data;
        document.getElementById('stats-grid').innerHTML = `
            ${renderStatBox('Students', d.students, 'fa-users', 'text-blue-600', 'bg-blue-100')}
            ${renderStatBox('Companies', d.industries, 'fa-building', 'text-orange-600', 'bg-orange-100')}
            ${renderStatBox('Live Jobs', d.jobs, 'fa-briefcase', 'text-purple-600', 'bg-purple-100')}
            ${renderStatBox('Applications', d.apps, 'fa-paper-plane', 'text-green-600', 'bg-green-100')}
        `;
        new Chart(document.getElementById('statChart'), { type: 'bar', data: { labels: ['Students', 'Companies', 'Jobs', 'Apps'], datasets: [{ label: 'Platform Data', data: [d.students, d.industries, d.jobs, d.apps], backgroundColor: ['#3b82f6', '#f97316', '#a855f7', '#22c55e'], borderRadius: 6 }] }, options: { responsive: true, plugins: { legend: { display: false } } } });
    } else showToast("Failed to load DB stats", true);
}

function renderStatBox(title, val, icon, textCol, bgCol) {
    return `<div class="clay-card text-center"><div class="w-14 h-14 ${bgCol} ${textCol} rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"><i class="fa-solid ${icon}"></i></div><div class="text-4xl font-black text-slate-800 mb-1">${val}</div><div class="text-sm font-semibold text-slate-500">${title}</div></div>`;
}

// Initial Boot
if (authToken && currentUser) navigate(`${currentUser.role}Dashboard`); else navigate('home');
}

// Init Application
navigate('home');
