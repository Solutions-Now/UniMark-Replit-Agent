import { useQuery } from "@tanstack/react-query";
import { BusRound } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export function ActiveRounds() {
  // Fetch active rounds
  const { data: activeRounds, isLoading } = useQuery<BusRound[]>({
    queryKey: ["/api/bus-rounds?status=in_progress"],
  });

  return (
    <div className="bg-white rounded-lg shadow-sm h-full">
      <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
        <h2 className="font-medium text-lg text-neutral-900">
          Active Bus Rounds
        </h2>
        <Link href="/bus-rounds">
          <Button
            variant="link"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All
          </Button>
        </Link>
      </div>
      <div className="p-2">
        {isLoading ? (
          <div className="p-4 text-center">Loading active rounds...</div>
        ) : activeRounds && activeRounds.length > 0 ? (
          activeRounds.map((round) => (
            <RoundItem key={round.id} round={round} />
          ))
        ) : (
          <div className="p-4 text-center text-neutral-500">
            No active rounds at the moment
          </div>
        )}

        {/* Placeholder data while we don't have real data */}
        <RoundItem
          round={{
            id: 1,
            name: "Morning Round #101",
            type: "morning",
            startTime: "8:00 AM",
            endTime: "9:15 AM",
            busId: 1,
            status: "in_progress",
            createdAt: new Date(),
          }}
          driver="John Smith"
          studentCount={32}
        />

        <RoundItem
          round={{
            id: 2,
            name: "Morning Round #203",
            type: "morning",
            startTime: "7:45 AM",
            endTime: "8:55 AM",
            busId: 2,
            status: "in_progress",
            createdAt: new Date(),
          }}
          driver="Emily Davis"
          studentCount={28}
        />

        <RoundItem
          round={{
            id: 3,
            name: "Morning Round #315",
            type: "morning",
            startTime: "7:30 AM",
            endTime: "8:45 AM",
            busId: 3,
            status: "in_progress",
            createdAt: new Date(),
          }}
          driver="Michael Brown"
          studentCount={30}
        />

        <RoundItem
          round={{
            id: 4,
            name: "Afternoon Round #102",
            type: "afternoon",
            startTime: "3:30 PM",
            endTime: "4:45 PM",
            busId: 1,
            status: "pending",
            createdAt: new Date(),
          }}
          driver="Robert Wilson"
          studentCount={31}
        />
      </div>
    </div>
  );
}

function RoundItem({
  round,
  driver,
  studentCount,
}: {
  round: BusRound;
  driver?: string;
  studentCount?: number;
}) {
  return (
    <div className="p-2 hover:bg-neutral-50 rounded-md transition-colors">
      <div className="flex items-center mb-2">
        <div
          className={cn(
            "h-10 w-10 rounded-md flex items-center justify-center text-white",
            round.status === "in_progress"
              ? round.type === "morning"
                ? "bg-primary-500"
                : "bg-secondary-500"
              : "bg-neutral-400"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="font-medium text-neutral-900">{round.name}</h3>
          <p className="text-xs text-neutral-500">
            {round.startTime} - {round.endTime}
          </p>
        </div>
        <div className="ml-auto">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              round.status === "in_progress"
                ? "bg-success-500 bg-opacity-10 text-success-500"
                : "bg-neutral-300 text-neutral-800"
            )}
          >
            {round.status === "in_progress" ? "In Progress" : "Pending"}
          </span>
        </div>
      </div>
      <div className="flex justify-between text-xs text-neutral-500 pl-12">
        <div>
          <span className="font-medium text-neutral-700">Driver:</span>{" "}
          {driver || "Unknown"}
        </div>
        <div>
          <span className="font-medium text-neutral-700">Students:</span>{" "}
          {studentCount || 0}
        </div>
      </div>
      <div className="flex justify-end mt-2">
        <Link href={`/live-tracking?round=${round.id}`}>
          <Button
            variant="link"
            className={cn(
              "text-xs",
              round.status === "in_progress"
                ? "text-primary-600 hover:text-primary-700 font-medium"
                : "text-neutral-500 cursor-not-allowed"
            )}
            disabled={round.status !== "in_progress"}
          >
            Track
          </Button>
        </Link>
      </div>
    </div>
  );
}
