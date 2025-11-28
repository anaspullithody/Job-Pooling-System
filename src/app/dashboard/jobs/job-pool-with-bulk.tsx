"use client";

import { useState } from "react";
import { JobPoolTable } from "@/features/jobs/components/job-pool-table";
import { BulkActions } from "./bulk-actions";

export function JobPoolTableWithBulk({ jobs }: { jobs: any[] }) {
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      {selectedJobIds.length > 0 && (
        <BulkActions
          selectedJobIds={selectedJobIds}
          onClearSelection={() => setSelectedJobIds([])}
        />
      )}
      <JobPoolTable
        jobs={jobs}
        onSelectionChange={setSelectedJobIds}
      />
    </div>
  );
}

