import { cn } from "@/lib/utils";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BookIcon,
  BusIcon,
  MapIcon,
  BellIcon,
} from "lucide-react";

export type StatCardProps = {
  title: string;
  value: string | number;
  icon: "students" | "buses" | "rounds" | "notifications";
  trend?: {
    value: number;
    direction: "up" | "down";
    label: string;
  };
  className?: string;
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  className,
}: StatCardProps) {
  // Define icon component based on type
  const IconComponent = () => {
    switch (icon) {
      case "students":
        return (
          <div className="bg-primary-50 p-3 rounded-md">
            <BookIcon className="h-6 w-6 text-primary-500" />
          </div>
        );
      case "buses":
        return (
          <div className="bg-secondary-500 bg-opacity-10 p-3 rounded-md">
            <BusIcon className="h-6 w-6 text-secondary-500" />
          </div>
        );
      case "rounds":
        return (
          <div className="bg-success-500 bg-opacity-10 p-3 rounded-md">
            <MapIcon className="h-6 w-6 text-success-500" />
          </div>
        );
      case "notifications":
        return (
          <div className="bg-danger-500 bg-opacity-10 p-3 rounded-md">
            <BellIcon className="h-6 w-6 text-danger-500" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-sm p-6", className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-neutral-500 text-sm">{title}</p>
          <h3 className="text-2xl font-medium mt-1 text-neutral-900">
            {value}
          </h3>
        </div>
        <IconComponent />
      </div>

      {trend && (
        <div className="flex items-center mt-4">
          <span
            className={cn(
              "flex items-center text-sm font-medium",
              trend.direction === "up"
                ? "text-success-500"
                : "text-danger-500"
            )}
          >
            {trend.direction === "up" ? (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            )}
            {trend.value}%
          </span>
          <span className="text-neutral-500 text-sm ml-2">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
