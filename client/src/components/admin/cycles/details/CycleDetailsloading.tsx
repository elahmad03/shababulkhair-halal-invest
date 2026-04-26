export default function CycleDetailsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Title */}
      <div className="h-8 bg-gray-300 rounded w-1/3" />

      {/* Badge */}
      <div className="h-6 bg-gray-300 rounded w-24" />

      {/* Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-24 bg-gray-300 rounded" />
        <div className="h-24 bg-gray-300 rounded" />
        <div className="h-24 bg-gray-300 rounded" />
      </div>

      {/* Tabs */}
      <div className="h-40 bg-gray-300 rounded" />
    </div>
  );
}