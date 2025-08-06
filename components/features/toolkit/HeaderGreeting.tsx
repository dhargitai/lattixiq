import * as React from "react";

interface HeaderGreetingProps {
  userName: string;
}

export function HeaderGreeting({ userName }: HeaderGreetingProps) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-medium text-gray-800 tracking-tight">
        Welcome back, {userName}!
      </h2>
    </div>
  );
}
