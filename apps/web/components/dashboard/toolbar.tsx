'use client';

import { Calendar, List, LayoutGrid } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '~/components/ui/toggle-group';
import { ViewType, SortBy } from './types';
import { SORT_OPTIONS } from '../../constants/constants';
import { Badge } from '~/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

interface ToolbarProps {
  viewMode: ViewType;
  onViewModeChange: (mode: ViewType) => void;
  sortBy?: SortBy; // allow undefined if parent might not pass it
  onSortChange: (sort: SortBy) => void;
  activeFilter?: string;
}

export function Toolbar({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  activeFilter,
}: ToolbarProps) {
  // fallback to 'date_created' when nothing is selected
  const effectiveSort: SortBy = (sortBy ?? 'date_created') as SortBy;

  const label = SORT_OPTIONS.find((opt) => opt.value === effectiveSort)?.label ?? 'Date created';

  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center gap-3">
        <h1 className="text-[22px] font-normal text-foreground">My Forms</h1>
        {activeFilter && activeFilter !== 'all' && (
          <Badge variant="secondary" className="capitalize text-sm font-medium px-2.5 py-0.5 shadow-sm">
            {activeFilter}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Select value={effectiveSort} onValueChange={onSortChange}>
          <SelectTrigger className="w-[150px] h-9 bg-white border-gray-200 text-sm shadow-sm">
            <SelectValue>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span className="text-foreground font-medium">{label}</span>
              </div>
            </SelectValue>
          </SelectTrigger>

          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => {
            if (value) onViewModeChange(value as ViewType);
          }}
          className="bg-gray-100 border border-gray-200 rounded-md h-9 p-0.5 space-x-0"
        >
          <ToggleGroupItem
            value="list"
            aria-label="List view"
            className="h-full px-2.5 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-foreground text-muted-foreground rounded-[4px] transition-all"
          >
            <List className="w-4 h-4 mr-1.5" />
            <span className="text-sm font-medium">List</span>
          </ToggleGroupItem>

          <ToggleGroupItem
            value="grid"
            aria-label="Grid view"
            className="h-full px-2.5 data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-foreground text-muted-foreground rounded-[4px] transition-all"
          >
            <LayoutGrid className="w-4 h-4 mr-1.5" />
            <span className="text-sm font-medium">Grid</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
