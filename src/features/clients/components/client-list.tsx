"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";

interface Client {
  id: string;
  name: string;
  phone?: string | null;
  contacts: Array<{
    id: string;
    phone?: string | null;
    email?: string | null;
  }>;
  clientJobs: Array<{
    id: string;
    status: string;
    createdAt: string;
  }>;
}

export function ClientList({ clients }: { clients: Client[] }) {
  const router = useRouter();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Contacts</TableHead>
            <TableHead>Recent Jobs</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No clients found.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.phone || "-"}</TableCell>
                <TableCell>
                  {client.contacts.length > 0
                    ? client.contacts
                        .map((c) => c.email || c.phone)
                        .filter(Boolean)
                        .join(", ")
                    : "-"}
                </TableCell>
                <TableCell>{client.clientJobs.length}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/clients/${client.id}`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (
                          confirm(`Are you sure you want to delete ${client.name}?`)
                        ) {
                          const response = await fetch(
                            `/api/clients/${client.id}`,
                            { method: "DELETE" }
                          );
                          if (response.ok) {
                            router.refresh();
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

