// admin.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Simulated Admin Analytics specific to SIH26044
router.get('/stats', async (req, res) => {
    // In a real scenario, this aggregates from MongoDB collections
    const demoStats = {
        totalStudents: 1250,
        totalInstitutions: 45,
        totalCompanies: 80,
        totalOpportunities: 150,
        totalApplications: 2480,
        placements: 620,
        placementRate: "78%",
        skillGapClosure: "42%"
    };

    res.json({ success: true, data: demoStats });
});

// Manage Users Interface Data
router.get('/users', async (req, res) => {
    const demoStudents = [
        { id: 1, name: 'Aarav Sharma', institution: 'NIT Durgapur', skillScore: 82, status: 'Active' },
        { id: 2, name: 'Priya Nair', institution: 'VIT Vellore', skillScore: 88, status: 'Active' },
        { id: 3, name: 'Rohan Sen', institution: 'Jadavpur University', skillScore: 76, status: 'Active' }
    ];
    res.json({ success: true, data: demoStudents });
});

module.exports = router;
