"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { JobStatus } from "@prisma/client";
import { useState, useEffect } from "react";

const statusOptions: { value: JobStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: JobStatus.IN_POOL, label: "In Pool" },
  { value: JobStatus.ASSIGNED, label: "Assigned" },
  { value: JobStatus.STARTED, label: "Started" },
  { value: JobStatus.PICKED, label: "Picked" },
  { value: JobStatus.COMPLETED, label: "Completed" },
  { value: JobStatus.CANCELLED, label: "Cancelled" },
  { value: JobStatus.FAILED, label: "Failed" },
];

export function JobFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState<JobStatus | "all">(
    (searchParams.get("status") as JobStatus) || "all"
  );

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/dashboard/jobs?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("search", search);
  };

  return (
    <div className="space-y-4 border rounded-lg p-4">
      <form onSubmit={handleSearch} className="flex gap-4 items-end">
        <div className="flex-1">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by guest name, contact, pickup, or drop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-48">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as JobStatus | "all");
              updateFilters("status", value);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit">Search</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSearch("");
            setStatus("all");
            router.push("/dashboard/jobs");
          }}
        >
          Clear
        </Button>
      </form>
    </div>
  );
}

