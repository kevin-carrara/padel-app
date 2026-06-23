export default function CourtsLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="skeleton mb-2" style={{ width: '60px', height: '12px' }} />
          <div className="skeleton" style={{ width: '140px', height: '32px' }} />
        </div>
        <div className="skeleton" style={{ width: '120px', height: '38px', borderRadius: '9999px' }} />
      </div>

      {/* Court card skeletons */}
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="card-court p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="skeleton mb-2" style={{ width: '140px', height: '20px' }} />
                <div className="flex gap-2">
                  <div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '999px' }} />
                  <div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '999px' }} />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="skeleton" style={{ width: '80px', height: '34px', borderRadius: '9999px' }} />
                <div className="skeleton" style={{ width: '80px', height: '34px', borderRadius: '9999px' }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-3" style={{ borderTop: '1px solid rgba(52,37,47,0.08)' }}>
              {[0, 1, 2].map(j => (
                <div key={j}>
                  <div className="skeleton mb-1" style={{ width: '60px', height: '10px' }} />
                  <div className="skeleton" style={{ width: '80px', height: '16px' }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
