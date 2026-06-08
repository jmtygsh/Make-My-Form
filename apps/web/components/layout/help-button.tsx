import { HelpCircle } from "lucide-react";

export function HelpButton() {
    return (
        <button className="fixed bottom-6 right-6 h-10 w-10 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
            <HelpCircle className="h-5 w-5" />
        </button>
    );
}