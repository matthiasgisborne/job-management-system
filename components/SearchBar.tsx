'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from 'react-toastify'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Job {
  id: number;
  title: string;
  description: string;
  address: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function SearchBar({ onSearch }: { onSearch: (jobs: Job[]) => void }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [newData, setNewData] = useState('');

  const handleSearch = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs/search?term=${searchTerm}`);
      if (!response.ok) {
        throw new Error('Failed to search jobs');
      }
      const data = await response.json();
      onSearch(data);
    } catch (error) {
      toast.error('Error searching jobs');
    }
  };

  const handleAddData = async () => {
    if (!selectedJob) return;

    try {
      const response = await fetch(`${API_URL}/jobs/${selectedJob.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additionalData: newData }),
      });
      if (!response.ok) {
        throw new Error('Failed to update job');
      }
      toast.success('Job updated successfully');
      setSelectedJob(null);
      setNewData('');
      handleSearch(); // Refresh the search results
    } catch (error) {
      toast.error('Error updating job');
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="text"
        placeholder="Search jobs..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-64"
      />
      <Button onClick={handleSearch}>Search</Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Add Data</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Data to Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Job ID"
              value={selectedJob?.id.toString() || ''}
              onChange={(e) => {
                const job = { id: parseInt(e.target.value), title: '', description: '', address: '', status: '', createdAt: '', updatedAt: '' };
                setSelectedJob(job);
              }}
            />
            <Input
              type="text"
              placeholder="Additional Data"
              value={newData}
              onChange={(e) => setNewData(e.target.value)}
            />
            <Button onClick={handleAddData}>Add Data</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

