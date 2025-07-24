import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json()); // For parsing application/json

let tasks = [
    {
        id: 1,
        title: 'Prepare Report',
        description: 'Compile the monthly financial report.',
        case_number: 'CASE-001',
        created_at: '2024-06-01T09:00:00Z',
        due_date: '2024-06-10T17:00:00Z',
        assignee_name: 'Alice Smith',
        status: 'In Progress',
        is_new: true,
    },
    {
        id: 2,
        title: 'Client Meeting',
        description: 'Meet with client to discuss project scope.',
        case_number: 'CASE-002',
        created_at: '2024-06-02T10:30:00Z',
        due_date: '2024-06-12T15:00:00Z',
        assignee_name: 'Bob Johnson',
        status: 'Due',
        is_new: false,
    },
    {
        id: 3,
        title: 'Review Contract',
        description: 'Review the new vendor contract for approval.',
        case_number: 'CASE-003',
        created_at: '2024-06-03T14:00:00Z',
        due_date: '2024-06-15T12:00:00Z',
        assignee_name: 'Charlie Lee',
        status: 'Done',
        is_new: false,
    },
    {
        id: 4,
        title: 'Draft Proposal',
        description: 'Draft the initial project proposal.',
        case_number: 'CASE-004',
        created_at: '2024-06-04T09:00:00Z',
        due_date: '2024-06-16T17:00:00Z',
        assignee_name: 'Dana White',
        status: 'Due',
        is_new: true,
    },
    {
        id: 5,
        title: 'Legal Review',
        description: 'Conduct legal review of documents.',
        case_number: 'CASE-005',
        created_at: '2024-06-05T11:00:00Z',
        due_date: '2024-06-18T15:00:00Z',
        assignee_name: 'Eve Black',
        status: 'In Progress',
        is_new: false,
    },
    {
        id: 6,
        title: 'Team Meeting',
        description: 'Weekly team sync-up.',
        case_number: 'CASE-006',
        created_at: '2024-06-06T13:00:00Z',
        due_date: '2024-06-20T10:00:00Z',
        assignee_name: 'Frank Green',
        status: 'Done',
        is_new: false,
    },
    {
        id: 7,
        title: 'Budget Planning',
        description: 'Plan the budget for Q3.',
        case_number: 'CASE-007',
        created_at: '2024-06-07T15:00:00Z',
        due_date: '2024-06-22T12:00:00Z',
        assignee_name: 'Grace Hopper',
        status: 'Over Due',
        is_new: true,
    },
    {
        id: 8,
        title: 'Client Feedback',
        description: 'Collect feedback from client.',
        case_number: 'CASE-008',
        created_at: '2024-06-08T10:00:00Z',
        due_date: '2024-06-24T16:00:00Z',
        assignee_name: 'Henry Ford',
        status: 'Due',
        is_new: false,
    },
    {
        id: 9,
        title: 'Test New Badge',
        description: 'This task should show a New badge until viewed.',
        case_number: 'CASE-009',
        created_at: '2024-06-09T10:00:00Z',
        due_date: '2024-06-30T16:00:00Z',
        assignee_name: 'Test User',
        status: 'Due',
        is_new: true,
    },
];

// Log every request
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/pms/tasks/', (req, res) => {
    try {
        res.send(tasks);
    } catch (err) {
        console.error('Error in /pms/tasks/:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.post('/pms/tasks/', (req, res) => {
    try {
        // In a real app, you would save the task to a database.
        // Here, just echo back the received data with a fake ID.
        const newTask = { id: Date.now(), ...req.body, is_new: true };
        tasks.push(newTask);
        res.status(201).send(newTask);
    } catch (err) {
        console.error('Error in POST /pms/tasks/:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.put('/pms/tasks/:id', (req, res) => {
    const { id } = req.params;
    const taskIndex = tasks.findIndex(t => t.id == id);
    if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
        res.send(tasks[taskIndex]);
    } else {
        res.status(404).send({ error: 'Task not found' });
    }
});

app.delete('/pms/tasks/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = tasks.length;
    tasks = tasks.filter(t => t.id != id);
    if (tasks.length < initialLength) {
        res.status(204).send();
    } else {
        res.status(404).send({ error: 'Task not found' });
    }
});

app.get('/pms/cases/', (req, res) => {
    try {
        res.send([
            {
                id: 1,
                case_number: 'CASE-001', // Case Number
                coming_up: 'Hearing on 2024-06-20', // Coming Up
                opened: '2024-05-01T09:00:00Z', // Opened
                last_updated: '2024-06-05T10:00:00Z', // Last Updated
                lawyer: 'Alice Smith', // Lawyer
                client: 'Acme Corp', // Client
                matter: 'Contract Dispute', // Matter
                case_documents: 3, // Case Documents (number of docs)
            },
            {
                id: 2,
                case_number: 'CASE-002',
                coming_up: 'Filing Deadline 2024-06-18',
                opened: '2024-05-10T11:30:00Z',
                last_updated: '2024-06-07T14:00:00Z',
                lawyer: 'Bob Johnson',
                client: 'Beta LLC',
                matter: 'Intellectual Property',
                case_documents: 5,
            },
            {
                id: 3,
                case_number: 'CASE-003',
                coming_up: 'Settlement Meeting 2024-06-25',
                opened: '2024-05-15T13:00:00Z',
                last_updated: '2024-06-09T16:00:00Z',
                lawyer: 'Charlie Lee',
                client: 'Gamma Inc',
                matter: 'Employment Law',
                case_documents: 2,
            },
        ]);
    } catch (err) {
        console.error('Error in /pms/cases/:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/pms/matters/', (req, res) => {
    try {
        res.send([
            { id: 1, title: 'Matter 1' },
            { id: 2, title: 'Matter 2' }
        ]);
    } catch (err) {
        console.error('Error in /pms/matters/:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

app.get('/pms/employees/', (req, res) => {
    try {
        res.send([
            { id: 1, full_name: 'Alice Smith' },
            { id: 2, full_name: 'Bob Johnson' }
        ]);
    } catch (err) {
        console.error('Error in /pms/employees/:', err);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Error handler middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).send({ error: 'Internal Server Error' });
});

app.listen(3001, () => {    
    console.log('Server is running on port 3001');
});