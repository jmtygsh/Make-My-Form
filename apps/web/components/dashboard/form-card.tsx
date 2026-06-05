'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { MoreHorizontal, Calendar, Inbox } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Form, ViewType } from './types';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

interface FormCardProps {
  form: Form;
  viewMode: ViewType;
  onMenuClick?: (formId: string) => void;
}



export function FormCard({ form, viewMode }: FormCardProps) {
  const router = useRouter();
  const isPublished = form.hasPublished;
  const statusColor = isPublished ? 'bg-green-500' : 'bg-yellow-500';
  const statusLabel = isPublished ? 'Published' : 'Draft';

  const handleEditClick = () => {
    router.push(`/dashboard/form/builder/${form.id}`);
  };

  const handlePublicCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!form.publicSlug) return toast.error("Public link not available");

    const url = `${window.location.origin}/from/${form.publicSlug}`;
    navigator.clipboard.writeText(url);
    toast.success("Public link copied to clipboard");
  }

  const handleUnlistedCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!form.unlistedSlug) return toast.error("Unlisted link not available");

    const url = `${window.location.origin}/form/${form.unlistedSlug}`;
    navigator.clipboard.writeText(url);
    toast.success("Unlisted link copied to clipboard");
  }


  const formattedDate = new Date(form.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (viewMode === 'list') {
    return (
      <Card
        className="flex flex-row items-center p-4 gap-4 hover:shadow-md transition-all group border-border/50 "
        tabIndex={0}

        aria-label={`Form: ${form.title}`}
      >
        {/* Left: Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColor}`} title={statusLabel} />
          <div className="flex flex-col min-w-0">
            <CardTitle className="text-base font-semibold truncate">{form.title}</CardTitle>
            {form.description ? (
              <p className="text-sm text-muted-foreground truncate mt-0.5">{form.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic mt-0.5">No description</p>
            )}
          </div>
        </div>

        {/* Middle: Badges */}
        <div className="hidden md:flex items-center justify-center w-24 shrink-0">
          <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5 capitalize">
            {form.visibility}
          </Badge>
        </div>

        {/* Right: Meta & Actions */}
        <div className="flex items-center gap-6 shrink-0 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 min-w-[100px] justify-end">
            <Inbox className="w-4 h-4" />
            <span>{form.submissionCount}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 min-w-[110px] justify-end">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 p-1 rounded-md hover:bg-muted"
                aria-label={`Options for ${form.title}`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={handlePublicCopyLink}>Copy Public link</DropdownMenuItem>
              <DropdownMenuItem onClick={handleUnlistedCopyLink}>Copy Unlisted link</DropdownMenuItem>
              <DropdownMenuItem onClick={handleEditClick}>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    );
  }

  return (
    <Card
      tabIndex={0}
      aria-label={`Form: ${form.title}`}
    >
      <div className="p-4 flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-start mb-4 shrink-0">
          <div className="flex gap-2 items-center">
            <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0 capitalize">
              {form.visibility}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 p-1 rounded-md hover:bg-muted -mt-1 -mr-1"
                aria-label={`Options for ${form.title}`}
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={handlePublicCopyLink}>Copy Public link</DropdownMenuItem>
              <DropdownMenuItem onClick={handleUnlistedCopyLink}>Copy Unlisted link</DropdownMenuItem>
              <DropdownMenuItem onClick={handleEditClick}>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg font-semibold line-clamp-1 shrink-0">{form.title}</CardTitle>
        {form.description ? (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{form.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic mt-2">No description</p>
        )}
      </div>
      <div className="px-4 pt-3 bg-muted/30 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground shrink-0">
        <div className="flex items-center gap-1.5" title="Date created">
          <Calendar className="w-3.5 h-3.5" />
          {formattedDate}
        </div>
        <div className="flex items-center gap-1.5" title="Total responses">
          <Inbox className="w-3.5 h-3.5" />
          {form.submissionCount} {form.submissionCount === 1 ? 'Response' : 'Responses'}
        </div>
      </div>
    </Card>
  );
}
