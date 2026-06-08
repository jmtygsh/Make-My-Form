import { Breadcrumb } from "~/components/layout/breadcrumb";
import { HelpButton } from "./help-button";

export function PageShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-full flex-col min-h-screen w-full bg-[#fafafa]">
            <Breadcrumb />
            {children}
            <HelpButton />
        </div>
    );
}