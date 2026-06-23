export default function FinancesLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="skeleton mb-2" style={{ width: '60px', height: '12px' }} />
        <div className="skeleton" style={{ width: '160px', height: '32px' }} />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map(i => (
          <div key={i} className="card stat-card-accent p-6">
            <div className="skeleton mb-3" style={{ width: '80px', height: '10px' }} />
            <div className="skeleton mb-2" style={{ width: '120px', height: '32px' }} />
            <div className="skeleton" style={{ width: '90px', height: '12px' }} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div>
        <div className="skeleton mb-3" style={{ width: '200px', height: '20px' }} />
        <div className="card overflow-hidden">
          <div className="divide-y" style={{ borderColor: 'rgba(52,37,47,0.08)' }}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <div key={i} className="px-5 py-3 flex items-center justify-between">
                <div className="skeleton" style={{ width: '180px', height: '14px' }} />
                <div className="skeleton" style={{ width: '80px', height: '14px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
