// components/AppointmentStatusDropdown.tsx
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  confirmed: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-red-500/10 text-red-500'
};

export const AppointmentStatusDropdown = ({ initialStatus, onStatusChange }) => {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      await onStatusChange(newStatus);
      setStatus(newStatus);
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`w-32 justify-start ${statusColors[status]}`}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {Object.entries(statusColors).map(([key, colorClass]) => (
          <DropdownMenuItem
            key={key}
            className={colorClass}
            onSelect={() => handleStatusChange(key)}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};