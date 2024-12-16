import express from 'express';
import cors from 'cors';
import { getAllJobs, getJobById, createJob, updateJobStatus, deleteJob, searchJobs, addDataToJob, getUser, updateUser, getAllEvents, createEvent, getAllEmails, createJobFromEmail, syncEmails, syncCalendar } from './db.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Existing routes...

app.get('/api/jobs/search', async (req, res) => {
  try {
    const { term } = req.query;
    const jobs = await searchJobs(term);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error searching jobs', error: error.message });
  }
});

app.patch('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { additionalData } = req.body;
    const updatedJob = await addDataToJob(id, additionalData);
    if (updatedJob) {
      res.json(updatedJob);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating job', error: error.message });
  }
});

// Other existing routes...

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

