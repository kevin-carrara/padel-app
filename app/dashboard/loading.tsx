export default function DashboardLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="skeleton mb-2" style={{ width: '80px', height: '12px' }} />
        <div className="skeleton" style={{ width: '240px', height: '36px' }} />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map(i => (
          <div key={i} className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="skeleton rounded-xl" style={{ width: '40px', height: '40px' }} />
              <div className="skeleton" style={{ width: '40px', height: '10px' }} />
            </div>
            <div className="skeleton mb-2" style={{ width: '80px', height: '40px' }} />
            <div className="skeleton" style={{ width: '120px', height: '12px' }} />
          </div>
        ))}
      </div>

      {/* Quick actions skeleton */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[0, 1, 2].map(i => (
          <div key={i} className="skeleton" style={{ width: '130px', height: '38px', borderRadius: '9999px' }} />
        ))}
      </div>

      {/* Table skeleton */}
      <div>
        <div className="skeleton mb-3" style={{ width: '140px', height: '20px' }} />
        <div className="card overflow-hidden">
          <div
            className="grid grid-cols-4 px-5 py-3"
            style={{ background: '#EBE9DF', borderBottom: '1px solid rgba(52,37,47,0.08)' }}
          >
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="skeleton" style={{ width: '70px', height: '10px' }} />
            ))}
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(52,37,47,0.08)' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="grid grid-cols-4 px-5 py-4 items-center gap-4">
                <div>
                  <div className="skeleton mb-1" style={{ width: '110px', height: '14px' }} />
                  <div className="skeleton" style={{ width: '70px', height: '10px' }} />
                </div>
                <div className="skeleton" style={{ width: '80px', height: '14px' }} />
                <div className="skeleton" style={{ width: '100px', height: '12px' }} />
                <div className="skeleton" style={{ width: '72px', height: '22px', borderRadius: '999px' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
