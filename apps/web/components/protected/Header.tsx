"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
    LayoutTemplate,
    Users,
    Globe,
    CircleHelp,
    LogOut,
    User,
    Settings,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { useMe, useLogout } from "~/hooks/api/auth";

const NAV_LINKS = [
    { href: "/dashboard", label: "Forms", icon: LayoutTemplate },
    { href: "/template", label: "Templates", icon: Users },
    { href: "/analytics", label: "Analytics", icon: Users },
    { href: "/public-forms", label: "Public Forms", icon: Globe },
];


const Header = () => {

    const router = useRouter();
    const pathname = usePathname();
    const { user, isLoading } = useMe();
    const { logout } = useLogout();

    const handleLogout = async () => {
        try {
            router.refresh();
            router.push("/login");

            await logout({});
            toast.success("Logged out successfully");
        } catch {
            toast.error("Failed to logout");
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (

        <header className="flex items-center justify-between px-6 h-14 border-b border-gray-200 bg-white shrink-0">
            <nav className="flex items-center h-full gap-2">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-2 h-full px-3 text-sm font-medium transition-colors border-b-2 ${isActive
                                ? "border-black text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            <div className="flex items-center gap-4">
                <Button
                    asChild
                    className="bg-[#1d7b69] hover:bg-[#166052] text-white rounded-full px-5 h-8 text-xs font-semibold"
                >
                    <Link href="/pricing">View plans</Link>
                </Button>
                <Link
                    href="/help"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    <CircleHelp className="w-5 h-5" />
                </Link>

                {/* User Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar className="w-8 h-8 cursor-pointer border border-gray-200 hover:border-gray-300 transition-colors">
                            {isLoading ? (
                                <AvatarFallback className="bg-gray-100" />
                            ) : (
                                <>
                                    <AvatarImage src={user?.profileImageUrl ?? undefined} />
                                    <AvatarFallback className="bg-[#1d7b69] text-white text-xs">
                                        {user?.fullName ? getInitials(user.fullName) : "U"}
                                    </AvatarFallback>
                                </>
                            )}
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 mt-2">
                        <div className="px-3 py-2.5">
                            <p className="text-sm font-medium text-foreground">
                                {user?.fullName || "User"}
                            </p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href="/account" className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Account
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link href="/settings" className="flex items-center gap-2">
                                <Settings className="w-4 h-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="cursor-pointer text-destructive focus:text-destructive"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

export default Header