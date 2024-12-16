'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { SearchBar } from '@/components/SearchBar'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Job {
  id: number;
  title: string;
  description: string;
  address: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  additionalData?: string;
}

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/jobs?limit=5`);
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      toast.error('Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchResults: Job[]) => {
    setJobs(searchResults);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Job Management Dashboard</h1>
      
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Job Management</CardTitle>
            <CardDescription>Create and manage jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Access all job-related functions here.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/jobs">Go to Jobs</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Schedule and view job appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Manage your job calendar and sync with external calendars.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/calendar">Open Calendar</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Integration</CardTitle>
            <CardDescription>Create jobs from emails</CardDescription>
          </CardHeader>
          <CardContent>
            <p>View and process job-related emails.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/emails">Check Emails</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Jobs</h2>
      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle>{job.title}</CardTitle>
                <CardDescription>Status: {job.status}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-2">{job.description}</p>
                <p className="text-sm text-gray-500">Address: {job.address}</p>
                {job.additionalData && (
                  <p className="text-sm text-gray-500 mt-2">Additional Data: {job.additionalData}</p>
                )}
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link href={`/jobs/${job.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <ToastContainer />
    </div>
  )
}

