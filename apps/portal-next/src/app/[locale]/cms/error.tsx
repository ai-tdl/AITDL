'use client'
// || ॐ श्री गणेशाय नमः ||
// CMS Specific Error Boundary

export default function CMSError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="p-8 bg-red-950/20 border border-red-500/20 rounded-2xl text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Content Studio Unreachable</h2>
            <p className="text-gray-400 mb-6 font-mono text-sm">
                {error.message || 'The CMS microservice failed to respond.'}
            </p>
            <button
                onClick={() => reset()}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
            >
                Retry Connection
            </button>
        </div>
    )
}
