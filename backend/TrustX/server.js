const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-Memory Database for Prototype
const db = {
    users: [],
    projects: [],
    milestones: []
};

// --- ROUTES ---

// Auth Routes
const authRoutes = express.Router();
authRoutes.post('/register', (req, res) => {
    const { name, email, password, role } = req.body;

    if (db.users.find(u => u.email === email)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = { id: Date.now().toString(), name, email, password, role };
    db.users.push(newUser);

    // Fake JWT Token
    const token = `fake-jwt-token-${newUser.id}-${role}`;
    res.json({ user: { id: newUser.id, name, email, role }, token });
});

authRoutes.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = `fake-jwt-token-${user.id}-${user.role}`;
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
});

// Project Routes
const projectRoutes = express.Router();

projectRoutes.post('/createProject', (req, res) => {
    const { title, description, budget, clientId, freelancerId } = req.body;

    const newProject = {
        id: Date.now().toString(),
        title,
        description,
        budget,
        clientId,
        freelancerId,
        status: 'open', // open, active, completed
        address: null // escrow contract address once created
    };

    db.projects.push(newProject);
    res.json(newProject);
});

projectRoutes.get('/projects', (req, res) => {
    res.json(db.projects);
});

// Milestone Routes
const milestoneRoutes = express.Router();

milestoneRoutes.get('/milestones', (req, res) => {
    const { projectId } = req.query;
    const projectMilestones = db.milestones.filter(m => m.projectId === projectId);
    res.json(projectMilestones);
});

milestoneRoutes.post('/createMilestone', (req, res) => {
    const { projectId, title, amount } = req.body;

    const newMilestone = {
        id: Date.now().toString(),
        projectId,
        title,
        amount,
        status: 'pending' // pending, funded, submitted, approved
    };

    db.milestones.push(newMilestone);
    res.json(newMilestone);
});

milestoneRoutes.post('/fundMilestone', (req, res) => {
    const { milestoneId } = req.body;
    const milestone = db.milestones.find(m => m.id === milestoneId);
    if (milestone) milestone.status = 'funded';
    res.json({ success: true, milestone });
});

milestoneRoutes.post('/submitWork', (req, res) => {
    const { milestoneId, proof } = req.body;
    const milestone = db.milestones.find(m => m.id === milestoneId);
    if (milestone) {
        milestone.status = 'submitted';
        milestone.proof = proof;
    }
    res.json({ success: true, milestone });
});

milestoneRoutes.post('/releasePayment', (req, res) => {
    const { milestoneId } = req.body;
    const milestone = db.milestones.find(m => m.id === milestoneId);
    if (milestone) {
        milestone.status = 'approved';
    }
    res.json({ success: true, milestone });
});

// Mount routes
app.use('/api', authRoutes);
app.use('/api', projectRoutes);
app.use('/api', milestoneRoutes);

app.get('/', (req, res) => {
    res.send('Freelance Escrow API MVP');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
