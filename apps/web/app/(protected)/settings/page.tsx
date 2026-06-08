"use client";

import React, { useState, useEffect } from "react";
import { useMe, useUpdateUser } from "~/hooks/api/auth";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SettingsPage() {
    const { user, isLoading } = useMe();
    const { updateUserAsync, status } = useUpdateUser();
    const isUpdating = status === "pending";

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        profileImageUrl: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                profileImageUrl: user.profileImageUrl || "",
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateUserAsync({
                fullName: formData.fullName,
                profileImageUrl: formData.profileImageUrl || null,
            });
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex-1 w-full max-w-4xl px-8 py-10">
            <div className="mb-6">
                <h1 className="text-lg font-semibold tracking-tight text-black/70">Settings</h1>
            </div>

            <div className="mb-10">
                <nav className="flex space-x-6 border-b border-gray-200">
                    <Link
                        href="#"
                        className="border-b-2 border-black pb-3 text-[14px] font-medium text-black/70"
                    >
                        My account
                    </Link>
                    <Link
                        href="#"
                        className="border-b-2 border-transparent pb-3 text-[14px] font-medium text-gray-500 hover:border-gray-300 hover:text-gray-900 transition-colors"
                    >
                        Notifications
                    </Link>

                    <Link
                        href="#"
                        className="border-b-2 border-transparent pb-3 text-[14px] font-medium text-gray-500 hover:border-gray-300 hover:text-gray-900 transition-colors"
                    >
                        Billing
                    </Link>
                </nav>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6 max-w-[500px]">
                <div className="space-y-3">
                    <Label className="text-[13px] font-medium text-gray-500">Photo</Label>
                    <Avatar className="h-[88px] w-[88px]">
                        <AvatarImage
                            src={formData.profileImageUrl || undefined}
                            alt="Profile picture"
                            className="object-cover"
                        />
                        <AvatarFallback className="text-lg bg-gray-100 text-black/70">
                            {user?.fullName?.charAt(0)?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                    </Avatar>
                    <Input
                        id="profileImageUrl"
                        value={formData.profileImageUrl}
                        onChange={handleInputChange}
                        className="h-9 rounded-md border-gray-300 shadow-sm focus:border-gray-400 focus:ring-0 text-[13px] text-black/70"
                        placeholder="Paste image URL…"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-[13px] font-medium text-gray-500">Full name</Label>
                    <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="h-9 rounded-md border-gray-300 shadow-sm focus:border-gray-400 focus:ring-0 text-[14px] text-black/70"
                        placeholder="Your full name"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[13px] font-medium text-gray-500">Email</Label>
                    <div className="relative">
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            readOnly
                            disabled
                            className="h-9 rounded-md border-gray-300 shadow-sm pr-24 bg-gray-50/50 text-[14px] text-black/70 focus-visible:ring-0"
                        />

                    </div>
                </div>



                <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={isUpdating}
                        className="h-7 px-4 bg-black hover:bg-gray-800 text-white rounded-md font-medium text-[13px] transition-colors"
                    >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Update
                    </Button>
                </div>
            </form>
        </div>
    );
}