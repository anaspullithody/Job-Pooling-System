"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogOut } from "lucide-react";
import { format } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";
import { JobStatus } from "@prisma/client";

const statusColors: Record<JobStatus, string> = {
  IN_POOL: "bg-gray-500",
  ASSIGNED: "bg-blue-500",
  STARTED: "bg-yellow-500",
  PICKED: "bg-orange-500",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-red-500",
  FAILED: "bg-red-600",
};

const statusLabels: Record<JobStatus, string> = {
  IN_POOL: "In Pool",
  ASSIGNED: "Assigned",
  STARTED: "Started",
  PICKED: "Picked",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  FAILED: "Failed",
};

const nextStatusMap: Record<JobStatus, JobStatus | null> = {
  IN_POOL: null,
  ASSIGNED: JobStatus.STARTED,
  STARTED: JobStatus.PICKED,
  PICKED: JobStatus.COMPLETED,
  COMPLETED: null,
  CANCELLED: null,
  FAILED: null,
};

interface Job {
  id: string;
  guestName: string;
  guestContact: string;
  pickup: string;
  drop: string;
  flight?: string | null;
  status: JobStatus;
  category?: string | null;
  vehicle?: string | null;
  driverName?: string | null;
  assignedPlate?: string | null;
  createdAt: string;
  client: {
    name: string;
  };
}

export default function DriverDashboardPage() {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCurrentJob();
  }, []);

  const fetchCurrentJob = async () => {
    try {
      const response = await fetch("/api/driver/jobs/current");
      if (response.status === 401) {
        router.push("/driver/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setJob(data.job);
      } else {
        setJob(null);
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: JobStatus) => {
    if (!job) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/driver/jobs/${job.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      await fetchCurrentJob();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/driver/logout", { method: "POST" });
    router.push("/driver/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Job Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You don't have any jobs assigned for today.
            </p>
            <Button onClick={fetchCurrentJob} variant="outline">
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextStatus = nextStatusMap[job.status];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Job</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Job Details</CardTitle>
              <Badge className={statusColors[job.status]}>
                {statusLabels[job.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Guest Name</p>
              <p className="font-medium text-lg">{job.guestName}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Contact</p>
              <p className="font-medium">{job.guestContact}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Pickup Location</p>
              <p className="font-medium">{job.pickup}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Drop Location</p>
              <p className="font-medium">{job.drop}</p>
            </div>

            {job.flight && (
              <div>
                <p className="text-sm text-muted-foreground">Flight</p>
                <p className="font-medium">{job.flight}</p>
              </div>
            )}

            {job.category && (
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{job.category}</p>
              </div>
            )}

            {job.vehicle && (
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="font-medium">{job.vehicle}</p>
              </div>
            )}

            {job.assignedPlate && (
              <div>
                <p className="text-sm text-muted-foreground">Plate Number</p>
                <p className="font-medium">{job.assignedPlate}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-medium">{job.client.name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {format(
                  zonedTimeToUtc(new Date(job.createdAt), "Asia/Dubai"),
                  "MMM dd, yyyy HH:mm"
                )}
              </p>
            </div>

            {nextStatus && (
              <div className="pt-4 border-t">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleStatusUpdate(nextStatus)}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    `Mark as ${statusLabels[nextStatus]}`
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

