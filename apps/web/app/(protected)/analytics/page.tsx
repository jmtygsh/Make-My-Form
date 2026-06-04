export default function AnalyticsPage() {
  return (
    <div className="flex flex-col flex-1 w-full h-full p-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h1 className="text-[22px] font-normal text-foreground">Analytics</h1>
      </div>
      <div className="grid gap-6">
        <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm">
          <h2 className="text-lg font-medium mb-2">Form Submissions Overview</h2>
          <p className="text-muted-foreground text-sm">Analytics dashboard coming soon...</p>
        </div>
      </div>
    </div>
  );
}
