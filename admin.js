const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
        const User = mongoose.model('User');
        const Opportunity = mongoose.model('Opportunity');
        const Application = mongoose.model('Application');

        const students = await User.countDocuments({ role: 'student' });
        const institutions = await User.countDocuments({ role: 'institution' });
        const industries = await User.countDocuments({ role: 'industry' });
        const jobs = await Opportunity.countDocuments();
        const apps = await Application.countDocuments();

        res.json({ 
            success: true, 
            data: { students, institutions, industries, jobs, apps } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
