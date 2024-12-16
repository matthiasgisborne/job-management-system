import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import OpenAI from 'openai';

let db;

async function initializeDatabase() {
  db = await open({
    filename: './jobs.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      address TEXT,
      status TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      additionalData TEXT
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      jobId INTEGER,
      start TEXT,
      end TEXT,
      FOREIGN KEY (jobId) REFERENCES jobs (id)
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT,
      sender TEXT,
      content TEXT,
      receivedAt TEXT
    )
  `);

  // Existing user table creation...
}

async function getDb() {
  if (!db) {
    await initializeDatabase();
  }
  return db;
}


export async function getAllJobs(limit) {
  const db = await getDb();
  let query = 'SELECT * FROM jobs ORDER BY createdAt DESC';
  if (limit) {
    query += ` LIMIT ${limit}`;
  }
  return db.all(query);
}

export async function getJobById(id) {
  const db = await getDb();
  return db.get('SELECT * FROM jobs WHERE id = ?', id);
}

export async function createJob(title, description, address) {
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO jobs (title, description, address, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, address, 'pending', new Date().toISOString(), new Date().toISOString()]
  );
  return getJobById(result.lastID);
}

export async function updateJobStatus(id, status) {
  const db = await getDb();
  await db.run(
    'UPDATE jobs SET status = ?, updatedAt = ? WHERE id = ?',
    [status, new Date().toISOString(), id]
  );
  return getJobById(id);
}

export async function deleteJob(id) {
  const db = await getDb();
  await db.run('DELETE FROM jobs WHERE id = ?', id);
}

export async function searchJobs(term) {
  const db = await getDb();
  return db.all(
    `SELECT * FROM jobs WHERE title LIKE ? OR description LIKE ? OR address LIKE ?`,
    [`%${term}%`, `%${term}%`, `%${term}%`]
  );
}

export async function addDataToJob(id, additionalData) {
  const db = await getDb();
  await db.run(
    'UPDATE jobs SET additionalData = ?, updatedAt = ? WHERE id = ?',
    [additionalData, new Date().toISOString(), id]
  );
  return getJobById(id);
}

export async function getAllEvents() {
  const db = await getDb();
  return db.all('SELECT * FROM events');
}

export async function createEvent(jobId, start, end) {
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO events (jobId, start, end) VALUES (?, ?, ?)',
    [jobId, start, end]
  );
  return getEventById(result.lastID);
}

export async function getEventById(id) {
  const db = await getDb();
  return db.get('SELECT * FROM events WHERE id = ?', id);
}

export async function getAllEmails() {
  const db = await getDb();
  return db.all('SELECT * FROM emails');
}

export async function createJobFromEmail(emailId) {
  const db = await getDb();
  const email = await db.get('SELECT * FROM emails WHERE id = ?', emailId);
  
  if (!email) {
    throw new Error('Email not found');
  }

  const openai = new OpenAI(process.env.OPENAI_API_KEY);
  
  const prompt = `Extract job details from the following email:
  Subject: ${email.subject}
  Content: ${email.content}
  
  Provide the following details:
  1. Job Title
  2. Job Description
  3. Job Address (if available)`;

  const response = await openai.completions.create({
    model: "text-davinci-002",
    prompt: prompt,
    max_tokens: 150
  });

  const aiResponse = response.choices[0].text.trim().split('\n');
  const title = aiResponse[0].replace('1. Job Title: ', '');
  const description = aiResponse[1].replace('2. Job Description: ', '');
  const address = aiResponse[2].replace('3. Job Address: ', '');

  const result = await db.run(
    'INSERT INTO jobs (title, description, address, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description, address, 'pending', new Date().toISOString(), new Date().toISOString()]
  );

  return getJobById(result.lastID);
}

export async function syncEmails() {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const messages = await transporter.listMessages();
  const db = await getDb();

  for (const message of messages) {
    const email = await transporter.getEmail(message.id);
    await db.run(
      'INSERT INTO emails (subject, sender, content, receivedAt) VALUES (?, ?, ?, ?)',
      [email.subject, email.from.text, email.text, email.date]
    );
  }
}

export async function syncCalendar() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  const calendar = google.calendar({ version: 'v3', auth });
  const db = await getDb();

  const events = await getAllEvents();

  for (const event of events) {
    const job = await getJobById(event.jobId);
    await calendar.events.insert({
      calendarId: 'primary',
      resource: {
        summary: job.title,
        description: job.description,
        start: {
          dateTime: event.start,
          timeZone: 'UTC',
        },
        end: {
          dateTime: event.end,
          timeZone: 'UTC',
        },
      },
    });
  }
}

// Make sure to export the new functions
export { getAllJobs, getJobById, createJob, updateJobStatus, deleteJob, searchJobs, addDataToJob, getUser, updateUser, getAllEvents, createEvent, getAllEmails, createJobFromEmail, syncEmails, syncCalendar };

