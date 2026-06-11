"use client";

// local file import 
import Homepage from "~/components/sections/Homepage";
import MarketingLayout from "./(marketing)/layout";

export default function Home() {
  return (
    <MarketingLayout>
      <Homepage />
    </MarketingLayout>
  );
}
