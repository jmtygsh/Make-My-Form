//apps/web/components/layout/empty-state.tsx

import { MoveRight } from "lucide-react";
import { Button } from "~/components/ui/button";

function Illustration() {
  return (
    <svg
      width="240"
      height="160"
      viewBox="0 0 240 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M60 120 C 50 80, 80 40, 120 40 C 160 40, 190 80, 180 120"
        stroke="#e5e7eb"
        strokeWidth="2"
        strokeDasharray="4 4"
        fill="none"
      />
      <path
        d="M120 40 C 130 60, 110 90, 120 110"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="120" cy="30" r="10" stroke="#9ca3af" strokeWidth="2" />
      <path
        d="M80 120 L 160 120 L 170 140 L 70 140 Z"
        stroke="#9ca3af"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="140" cy="130" r="6" fill="#ec4899" />
      <path
        d="M138 130 L 142 130 M140 128 L 140 132"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M40 90 L 45 80 L 55 85 L 45 95 Z" stroke="#d1d5db" strokeWidth="1" />
      <circle cx="190" cy="70" r="3" stroke="#d1d5db" strokeWidth="1" />
      <path
        d="M200 100 L 210 90 M200 90 L 210 100"
        stroke="#d1d5db"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full">
      <div className="relative isolate flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 px-6">
        <div className="mb-4">
          <Illustration />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No forms yet</h2>
        <p className="text-sm text-gray-500 max-w-[280px]">
          Roll up your sleeves and let's get started.
          <br />
          It's as simple as one-two-three.
        </p>
        <Button variant="textured" className="h-10 px-8 text-base" onClick={onCreate}>
          Create your form
          <MoveRight className="ml-2 size-5" />
        </Button>
      </div>
    </div>
  );
}
