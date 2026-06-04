'use client';

import { useState } from 'react';
import { Search, ChevronDown, Plus, ChevronRight } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

interface SidebarProps {
  onCreateClick: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function Sidebar({
  onCreateClick,
  searchValue,
  onSearchChange,
  activeFilter,
  onFilterChange,
}: SidebarProps) {
  return (
    <aside
      className="w-64 flex-shrink-0 border-l border-t border-r border-gray-500 flex flex-col p-4 gap-6"
      role="navigation"
      aria-label="Dashboard sidebar"
    >
      <Button
        onClick={onCreateClick}
        className="bg-[#3f3244] hover:bg-[#342938] text-white flex items-center justify-center gap-2 w-full h-10 rounded-md shadow-sm font-medium transition-colors cursor-pointer"
        aria-label="Create new form"
      >
        <Plus className="w-4 h-4" />
        Create form
      </Button>

      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          placeholder="Search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-transparent border-none shadow-none focus-visible:ring-0 placeholder:text-muted-foreground text-sm h-9"
          aria-label="Search forms"
        />
      </div>

      <nav className="flex flex-col gap-1">
        <button
          onClick={() => onFilterChange(activeFilter === 'draft' ? 'all' : 'draft')}
          className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium ${activeFilter === 'draft' ? 'text-foreground bg-gray-100/50' : 'text-muted-foreground'
            } rounded-md transition-colors`}
        >
          Draft Forms
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onFilterChange(activeFilter === 'public' ? 'all' : 'public')}
          className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium ${activeFilter === 'public' ? 'text-foreground bg-gray-100/50' : 'text-muted-foreground'
            } rounded-md transition-colors`}
        >
          Public Forms
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </aside>
  );
}
