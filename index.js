// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const adminRoutes = require('./admin');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// MONGODB CONNECTION (Serverless Optimized)
// ==========================================
let isConnected = false;

const connectDB = async () => {
    if (isConnected) return;
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = db.connections[0].readyState;
        console.log('MongoDB Connected Successfully.');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

// ==========================================
// MONGODB MODELS
// ==========================================
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    passwordHash: String, // Simplified for prototype
    role: { type: String, enum: ['student', 'institution', 'industry', 'admin'] },
    institution: String,
    skills: [String],
    profileCompletion: Number
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const opportunitySchema = new mongoose.Schema({
    title: String,
    company: String,
    type: String, // Job or Internship
    requiredSkills: [String],
    stipend: String,
    location: String
});
const Opportunity = mongoose.models.Opportunity || mongoose.model('Opportunity', opportunitySchema);

// ==========================================
// API ROUTES
// ==========================================
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Admin Router mapping
app.use('/api/admin', adminRoutes);

// Auth - Demo Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Demo Credentials Checker
    const demoAccounts = {
        'student@techaura.demo': { role: 'student', name: 'Aarav Sharma' },
        'institution@techaura.demo': { role: 'institution', name: 'TechAura Innovation Hub' },
        'company@techaura.demo': { role: 'industry', name: 'TechNova Solutions' },
        'admin@techaura.demo': { role: 'admin', name: 'System Administrator' }
    };

    if (demoAccounts[email] && password.includes('123')) {
        return res.json({ success: true, token: 'demo-jwt-token-123', user: demoAccounts[email] });
    }
    
    res.status(401).json({ success: false, message: 'Invalid credentials. Use demo accounts.' });
});

// Opportunities (Jobs/Internships)
app.get('/api/opportunities', async (req, res) => {
    // Seed dummy data if empty
    const count = await Opportunity.countDocuments();
    if(count === 0) {
        await Opportunity.insertMany([
            { title: 'Software Developer Intern', company: 'TechNova Solutions', type: 'Internship', requiredSkills: ['Java', 'SQL', 'HTML/CSS'], stipend: '₹15,000/mo', location: 'Bengaluru' },
            { title: 'Data Analyst', company: 'DataSphere India', type: 'Job', requiredSkills: ['Python', 'SQL', 'Communication'], stipend: '₹6,00,000/yr', location: 'Mumbai' },
            { title: 'Cloud Engineer', company: 'CloudBridge Technologies', type: 'Job', requiredSkills: ['AWS', 'Linux', 'Problem Solving'], stipend: '₹8,00,000/yr', location: 'Pune' }
        ]);
    }
    const opps = await Opportunity.find();
    res.json({ success: true, data: opps });
});

// AI Demo Matching Logic
app.post('/api/match', async (req, res) => {
    const { studentSkills, opportunityId } = req.body;
    const opp = await Opportunity.findById(opportunityId);
    
    if(!opp) return res.status(404).json({ success: false });

    const matched = opp.requiredSkills.filter(skill => studentSkills.includes(skill));
    const score = Math.round((matched.length / opp.requiredSkills.length) * 100);
    const missing = opp.requiredSkills.filter(skill => !studentSkills.includes(skill));

    res.json({ 
        success: true, 
        matchScore: score, 
        matchedSkills: matched, 
        missingSkills: missing 
    });
});

// Fallback to SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server (Used for local dev, Vercel maps directly to app)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TechAura running on port ${PORT}`));

module.exports = app;
