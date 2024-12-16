export class Job {
  constructor(id, title, description, address, status = 'pending') {
    this.id = id;
    this.title = title;
    this.description = description;
    this.address = address;
    this.status = status;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

export class JobManager {
  constructor() {
    this.jobs = [];
    this.nextId = 1;
  }

  createJob(title, description, address) {
    const job = new Job(this.nextId++, title, description, address);
    this.jobs.push(job);
    return job;
  }

  getAllJobs() {
    return this.jobs;
  }

  getJobById(id) {
    return this.jobs.find(job => job.id === id);
  }

  updateJobStatus(id, newStatus) {
    const job = this.getJobById(id);
    if (job) {
      job.status = newStatus;
      job.updatedAt = new Date();
      return job;
    }
    return null;
  }

  deleteJob(id) {
    const index = this.jobs.findIndex(job => job.id === id);
    if (index !== -1) {
      this.jobs.splice(index, 1);
      return true;
    }
    return false;
  }
}

