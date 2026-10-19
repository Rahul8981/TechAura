const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const adminRoutes = require('./admin');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// ==========================================
// MONGODB CONNECTION
// ==========================================
let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in .env");
        const db = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = db.connections[0].readyState;
        console.log('Real MongoDB Connected.');
    } catch (error) {
        console.error('MongoDB Error:', error);
    }
};

// ==========================================
// REAL MONGOOSE SCHEMAS
// ==========================================
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'institution', 'industry', 'admin'], required: true },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const StudentProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    skills: [String],
});
const StudentProfile = mongoose.models.StudentProfile || mongoose.model('StudentProfile', StudentProfileSchema);

const OpportunitySchema = new mongoose.Schema({
    title: String,
    company: String,
    industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['Job', 'Internship'] },
    requiredSkills: [String],
    location: String,
    createdAt: { type: Date, default: Date.now }
});
const Opportunity = mongoose.models.Opportunity || mongoose.model('Opportunity', OpportunitySchema);

const ApplicationSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
    matchScore: Number,
    appliedAt: { type: Date, default: Date.now }
});
const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);

// ==========================================
// MIDDLEWARE & ROUTES
// ==========================================
app.use(async (req, res, next) => { await connectDB(); next(); });

const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ success: false, message: 'Access Denied.' });
    try {
        req.user = jwt.verify(token.split(' ')[1], JWT_SECRET);
        next();
    } catch (err) { res.status(400).json({ success: false, message: 'Invalid Token.' }); }
};

// Mount Admin routes
app.use('/api/admin', authenticate, adminRoutes);

// Auth
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'Email exists' });

        const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();

        if (role === 'student') {
            // Give student demo skills for matching
            await new StudentProfile({ userId: user._id, skills: ['React', 'Node.js', 'JavaScript', 'HTML', 'CSS', 'Communication'] }).save();
        }

        const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ success: true, token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ success: true, token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// Opportunities
app.get('/api/opportunities', async (req, res) => {
    const opps = await Opportunity.find().sort({ createdAt: -1 });
    res.json({ success: true, data: opps });
});

app.post('/api/opportunities', authenticate, async (req, res) => {
    if (req.user.role !== 'industry') return res.status(403).json({ success: false, message: 'Only industry can post.' });
    const opp = new Opportunity({ ...req.body, industryId: req.user.id });
    await opp.save();
    res.json({ success: true, data: opp });
});

// Apply & AI Match
app.post('/api/apply', authenticate, async (req, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ success: false, message: 'Only students can apply.' });
    try {
        const { opportunityId } = req.body;
        if (await Application.findOne({ studentId: req.user.id, opportunityId })) 
            return res.status(400).json({ success: false, message: 'Already applied!' });

        const profile = await StudentProfile.findOne({ userId: req.user.id });
        const job = await Opportunity.findById(opportunityId);

        let matchScore = 0;
        if (profile && job && job.requiredSkills.length > 0) {
            const matched = job.requiredSkills.filter(skill => profile.skills.some(ps => ps.toLowerCase() === skill.toLowerCase()));
            matchScore = Math.round((matched.length / job.requiredSkills.length) * 100);
        }

        await new Application({ studentId: req.user.id, opportunityId, matchScore }).save();
        res.json({ success: true, matchScore });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// SPA Fallback
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TechAura running on port ${PORT}`));
