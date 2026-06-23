export default function BookingsLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="skeleton mb-2" style={{ width: '60px', height: '12px' }} />
          <div className="skeleton" style={{ width: '160px', height: '32px' }} />
        </div>
        <div className="skeleton" style={{ width: '100px', height: '38px', borderRadius: '9999px' }} />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton" style={{ width: '100px', height: '34px', borderRadius: '9999px' }} />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="card overflow-hidden">
        <div
          className="grid grid-cols-5 px-5 py-3"
          style={{ background: '#EBE9DF', borderBottom: '1px solid rgba(52,37,47,0.08)' }}
        >
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ width: '70px', height: '10px' }} />
          ))}
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(52,37,47,0.08)' }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="grid grid-cols-5 px-5 py-4 items-center gap-4">
              <div>
                <div className="skeleton mb-1" style={{ width: '110px', height: '14px' }} />
                <div className="skeleton" style={{ width: '70px', height: '10px' }} />
              </div>
              <div className="skeleton" style={{ width: '80px', height: '14px' }} />
              <div className="skeleton" style={{ width: '100px', height: '12px' }} />
              <div className="skeleton" style={{ width: '60px', height: '14px' }} />
              <div className="skeleton" style={{ width: '72px', height: '22px', borderRadius: '999px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
