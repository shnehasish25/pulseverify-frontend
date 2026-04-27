import { Component } from 'react';

/**
 * ErrorBoundary — Catches any unhandled React rendering errors
 * and shows a recoverable UI instead of a white screen.
 *
 * Usage: Wrap any page or component tree:
 *   <ErrorBoundary> <MyPage /> </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center px-6 py-16">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="#ef4444"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-[20px] font-bold text-white mb-2">
            Something unexpected happened
          </h2>
          <p className="text-[14px] text-zinc-500 max-w-md mb-6 leading-relaxed">
            {this.props.fallbackMessage ||
              "This section encountered an error. Your data is safe — try refreshing this section."}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleRetry}
              className="px-5 py-2.5 bg-red-500 hover:bg-red-400 text-white text-[13px] font-semibold rounded-xl shadow-md shadow-red-500/20 active:scale-95 transition-all flex items-center gap-2"
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
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[13px] font-medium rounded-xl transition-all"
            >
              Reload page
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 w-full max-w-lg text-left">
              <summary className="text-[11px] text-zinc-600 cursor-pointer hover:text-zinc-400">
                Technical details
              </summary>
              <pre className="mt-2 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-[11px] text-red-400/80 overflow-auto max-h-40">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
