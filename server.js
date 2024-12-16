import express from 'express';
import cors from 'cors';
import { JobManager } from './jobManager.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const jobManager = new JobManager();

app.get('/api/jobs', (req, res) => {
  res.json(jobManager.getAllJobs());
});

app.get('/api/jobs/:id', (req, res) => {
  const job = jobManager.getJobById(Number(req.params.id));
  if (job) {
    res.json(job);
  } else {
    res.status(404).json({ message: 'Job not found' });
  }
});

app.post('/api/jobs', (req, res) => {
  const { title, description } = req.body;
  const newJob = jobManager.createJob(title, description);
  res.status(201).json(newJob);
});

app.put('/api/jobs/:id', (req, res) => {
  const { status } = req.body;
  const updatedJob = jobManager.updateJobStatus(Number(req.params.id), status);
  if (updatedJob) {
    res.json(updatedJob);
  } else {
    res.status(404).json({ message: 'Job not found' });
  }
});

app.delete('/api/jobs/:id', (req, res) => {
  const deleted = jobManager.deleteJob(Number(req.params.id));
  if (deleted) {
    res.status(204).end();
  } else {
    res.status(404).json({ message: 'Job not found' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

