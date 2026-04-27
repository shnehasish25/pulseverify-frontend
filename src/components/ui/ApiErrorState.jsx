/**
 * ApiErrorState — Inline error state for failed API calls.
 * Shows a clear error message with a prominent "Try Again" button.
 * Replaces vague toast messages with actionable recovery UI.
 */
export default function ApiErrorState({ error, onRetry, title, className = '' }) {
  const errorMessage = typeof error === 'string'
    ? error
    : error?.response?.data?.message || error?.message || 'Something went wrong.';

  const isNetworkError = !error?.response && error?.code !== 'ECONNABORTED';
  const isTimeout = error?.code === 'ECONNABORTED';

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        {isNetworkError ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39M10.71 5.05A16 16 0 0122.56 9M1.42 9a15.91 15.91 0 014.7-2.88M8.53 16.11a6 6 0 016.95 0M12 20h.01" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="1.5" />
            <path d="M12 8v4M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>

      <h3 className="text-[16px] font-semibold text-white mb-1">
        {title || (isNetworkError ? "Can't reach the server" : isTimeout ? "Request timed out" : "Failed to load data")}
      </h3>
      <p className="text-[13px] text-zinc-500 max-w-sm mb-6 leading-relaxed">
        {isNetworkError
          ? "Please check that the backend server is running and try again."
          : isTimeout
          ? "The request took too long. This might be a temporary issue."
          : errorMessage}
      </p>

      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-400 text-white text-[13px] font-semibold rounded-xl shadow-md shadow-red-500/20 active:scale-95 transition-all"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Try again
      </button>
    </div>
  );
}
