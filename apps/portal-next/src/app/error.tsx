'use client'
// || ॐ श्री गणेशाय नमः ||
// Global Error Boundary for AITDL Portal

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Portal Runtime Error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Something went wrong</h2>
            <p className="text-purple-300 mb-8 max-w-md">
                An unexpected error occurred in the AITDL Platform.
                Please try refreshing the page or contact support if the issue persists.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={() => reset()}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                >
                    Try Again
                </button>
                <a
                    href="/"
                    className="px-6 py-3 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                    Go Home
                </a>
            </div>
        </div>
    )
}
