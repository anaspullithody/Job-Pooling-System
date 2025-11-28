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

interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  contacts: Array<{
    id: string;
    phone?: string | null;
    email?: string | null;
  }>;
  supplierCategories: Array<{
    id: string;
    category: string;
    vehicleCount: number;
  }>;
  supplierVehicles: Array<{
    id: string;
    category: string;
    regNumber: string;
    model?: string | null;
  }>;
}

export function SupplierList({ suppliers }: { suppliers: Supplier[] }) {
  const router = useRouter();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Contacts</TableHead>
            <TableHead>Categories</TableHead>
            <TableHead>Vehicles</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No suppliers found.
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.phone || "-"}</TableCell>
                <TableCell>
                  {supplier.contacts.length > 0
                    ? supplier.contacts
                        .map((c) => c.email || c.phone)
                        .filter(Boolean)
                        .join(", ")
                    : "-"}
                </TableCell>
                <TableCell>
                  {supplier.supplierCategories.length > 0
                    ? supplier.supplierCategories
                        .map((c) => `${c.category} (${c.vehicleCount})`)
                        .join(", ")
                    : "-"}
                </TableCell>
                <TableCell>{supplier.supplierVehicles.length}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/suppliers/${supplier.id}`)
                      }
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (
                          confirm(
                            `Are you sure you want to delete ${supplier.name}?`
                          )
                        ) {
                          // Handle delete
                          const response = await fetch(
                            `/api/suppliers/${supplier.id}`,
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

