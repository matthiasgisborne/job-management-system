'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Email {
  id: number;
  subject: string;
  sender: string;
  content: string;
  receivedAt: string;
}

interface Job {
  id: number;
  title: string;
  description: string;
  address: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/emails`);
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      const data = await response.json();
      setEmails(data);
    } catch (error) {
      toast.error('Error fetching emails');
    } finally {
      setLoading(false);
    }
  };

  const createJobFromEmail = async (emailId: number) => {
    try {
      const response = await fetch(`${API_URL}/create-job-from-email/${emailId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to create job from email');
      }
      const job: Job = await response.json();
      toast.success(`Job created: ${job.title}`);
      fetchEmails(); // Refresh the email list
    } catch (error) {
      toast.error('Error creating job from email');
    }
  };

  const syncEmails = async () => {
    try {
      const response = await fetch(`${API_URL}/sync-emails`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to sync emails');
      }
      toast.success('Emails synced successfully');
      fetchEmails(); // Refresh the email list
    } catch (error) {
      toast.error('Error syncing emails');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Email Integration</h1>
      <Button onClick={syncEmails} className="mb-4">Sync Emails</Button>
      {loading ? (
        <p>Loading emails...</p>
      ) : (
        <div className="space-y-4">
          {emails.map((email) => (
            <Card key={email.id}>
              <CardHeader>
                <CardTitle>{email.subject}</CardTitle>
                <CardDescription>From: {email.sender}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{email.content.substring(0, 100)}...</p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => createJobFromEmail(email.id)}>Create Job</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      <ToastContainer />
    </div>
  )
}

