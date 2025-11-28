"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobStatus } from "@prisma/client";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const statusOptions: { value: JobStatus; label: string }[] = [
  { value: JobStatus.ASSIGNED, label: "Assigned" },
  { value: JobStatus.STARTED, label: "Started" },
  { value: JobStatus.PICKED, label: "Picked" },
  { value: JobStatus.COMPLETED, label: "Completed" },
  { value: JobStatus.CANCELLED, label: "Cancelled" },
  { value: JobStatus.FAILED, label: "Failed" },
];

interface BulkActionsProps {
  selectedJobIds: string[];
  onClearSelection: () => void;
}

export function BulkActions({
  selectedJobIds,
  onClearSelection,
}: BulkActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | "">("");

  const handleBulkStatusChange = async () => {
    if (!selectedStatus || selectedJobIds.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch("/api/jobs/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobIds: selectedJobIds,
          action: "status_change",
          status: selectedStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update jobs");
      }

      router.refresh();
      onClearSelection();
    } catch (error) {
      console.error("Error updating jobs:", error);
      alert("Failed to update jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedJobIds.length} job(s)?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/jobs/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobIds: selectedJobIds,
          action: "delete",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete jobs");
      }

      router.refresh();
      onClearSelection();
    } catch (error) {
      console.error("Error deleting jobs:", error);
      alert("Failed to delete jobs");
    } finally {
      setLoading(false);
    }
  };

  if (selectedJobIds.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted">
      <span className="text-sm font-medium">
        {selectedJobIds.length} job(s) selected
      </span>

      <div className="flex items-center gap-2">
        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value as JobStatus)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Change status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleBulkStatusChange}
          disabled={!selectedStatus || loading}
          size="sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Update Status"
          )}
        </Button>
      </div>

      <Button
        variant="destructive"
        onClick={handleBulkDelete}
        disabled={loading}
        size="sm"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>

      <Button variant="outline" onClick={onClearSelection} size="sm">
        Clear Selection
      </Button>
    </div>
  );
}

