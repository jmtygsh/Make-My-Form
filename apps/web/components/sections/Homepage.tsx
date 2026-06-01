"use client";

import Link from "next/link";

import { MoveRight } from "lucide-react";

// local file import 
import { Button } from "~/components/ui/button";
import Animate from "~/components/sections/Animate";
import LogoTicker from "~/components/sections/LogoTicker";
import Features from "~/components/sections/Features";
import Testimonials from "~/components/sections/Testimonials";
import DashedAnimation from "~/components/sections/DashedAnimation";
import LegacyAnimation from "~/components/sections/LegacyAnimation";
import PowerfulFeatures from "~/components/sections/PowerfulFeatures";
import { Contact } from "~/components/sections/Contact";


const Homepage = () => {
    return (
        <>
            <main className="min-h-[calc(60vh-30px)] sm:min-h-[calc(100vh-80px)] flex-none relative flex flex-col p-4 md:p-6 text-center">
                <div className="absolute inset-0 w-full h-full pointer-events-none mt-10">
                    <Animate />
                </div>

                {/* Overlay Content */}
                <div className="relative z-10 max-w-6xl mx-auto p-10">
                    <h1 className="mt-10 sm:mt-20 mb-8 text-4xl sm:text-[80px] font-heading drop-shadow-2xl drop-shadow-primary/20">
                        Online form builder,<br />
                        that gets more responses
                    </h1>
                    <p className="mb-8 text-lg md:text-xl text-foreground-muted text-shadow-sm">
                        Build engaging online forms, surveys, or quizzes in seconds.
                    </p>

                    <div className="mt-8 flex justify-center">
                        <Link href="/dashboard">
                            <Button variant="textured" className="h-12 px-8 text-base">
                                Create your form
                                <MoveRight className="ml-2 size-5" />
                            </Button>
                        </Link>
                    </div>

                </div>

            </main >
            <LogoTicker />
            <Features />
            <Testimonials />
            <DashedAnimation />
            <LegacyAnimation />
            <PowerfulFeatures />
            <Contact />
        </>
    )
}
export default Homepage;