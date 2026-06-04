'use client';

import { useState } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';

interface SidebarProps {
  onCreateClick: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

type VisibilityFilter = 'unlisted' | 'public';

export function Sidebar({
  onCreateClick,
  searchValue,
  onSearchChange,
}: SidebarProps) {
  const [expandedFilter, setExpandedFilter] = useState<VisibilityFilter | null>(null);

  const toggleFilter = (filter: VisibilityFilter) => {
    setExpandedFilter(expandedFilter === filter ? null : filter);
  };

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
          onClick={() => toggleFilter('unlisted')}
          className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100/50 rounded-md transition-colors"
          aria-expanded={expandedFilter === 'unlisted'}
        >
          Unlisted
          <ChevronDown
            className={`w-4 h-4 transition-transform ${expandedFilter === 'unlisted' ? 'rotate-180' : ''
              }`}
          />
        </button>

        <button
          onClick={() => toggleFilter('public')}
          className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-gray-100/50 rounded-md transition-colors"
          aria-expanded={expandedFilter === 'public'}
        >
          Public
          <ChevronDown
            className={`w-4 h-4 transition-transform ${expandedFilter === 'public' ? 'rotate-180' : ''
              }`}
          />
        </button>
      </nav>
    </aside>
  );
}
