'use client'

import { useState, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

moment.locale('en-GB')
const localizer = momentLocalizer(moment)

interface Job {
  id: number;
  title: string;
  description: string;
  address: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  job: Job;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    fetchEvents();
    fetchJobs();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/events`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      })));
    } catch (error) {
      toast.error('Error fetching events');
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      toast.error('Error fetching jobs');
    }
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    setSelectedDate(start);
  };

  const handleBookJob = async () => {
    if (!selectedJob || !selectedDate || !startTime || !endTime) {
      toast.error('Please fill in all fields');
      return;
    }

    const start = moment(selectedDate).set({
      hour: parseInt(startTime.split(':')[0]),
      minute: parseInt(startTime.split(':')[1])
    }).toDate();

    const end = moment(selectedDate).set({
      hour: parseInt(endTime.split(':')[0]),
      minute: parseInt(endTime.split(':')[1])
    }).toDate();

    try {
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob.id,
          start,
          end
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to book job');
      }

      toast.success('Job booked successfully');
      fetchEvents();
      setSelectedJob(null);
      setSelectedDate(null);
      setStartTime('');
      setEndTime('');
    } catch (error) {
      toast.error('Error booking job');
    }
  };

  const syncCalendar = async () => {
    try {
      const response = await fetch(`${API_URL}/sync-calendar`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to sync calendar');
      }
      toast.success('Calendar synced successfully');
    } catch (error) {
      toast.error('Error syncing calendar');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Job Calendar</h1>
      <div className="mb-4 flex justify-between items-center">
        <Button onClick={syncCalendar}>Sync with Apple/Google Calendar</Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Book Job</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book a Job</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select onValueChange={(value) => setSelectedJob(jobs.find(job => job.id === parseInt(value)) || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()}>{job.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : ''}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              />
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="Start Time"
              />
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="End Time"
              />
              <Button onClick={handleBookJob}>Book Job</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectSlot={handleSelectSlot}
        selectable
      />
      <ToastContainer />
    </div>
  )
}

