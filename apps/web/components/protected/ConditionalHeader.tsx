"use client";

import { usePathname } from "next/navigation";
import Header from "~/components/protected/Header";

export default function ConditionalHeader() {
    const pathname = usePathname();

    // Hide the header on the form builder route
    const isFormBuilder = pathname?.includes("/dashboard/form/builder");

    if (isFormBuilder) {
        return null;
    }

    return <Header />;
}
