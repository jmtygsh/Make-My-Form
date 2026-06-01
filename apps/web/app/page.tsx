"use client";

// local file import 
import Header from "~/components/sections/Header";
import Footer from "~/components/sections/Footer";
import Homepage from "~/components/sections/Homepage";



export default function Home() {
  return (
    <div className="min-h-screen text-foreground flex flex-col">
      < Header />
      <Homepage />
      <Footer />
    </div >
  );
}
