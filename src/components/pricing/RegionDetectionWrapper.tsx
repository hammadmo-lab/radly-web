'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RegionSelectionModal } from './RegionSelectionModal';

interface RegionDetectionWrapperProps {
    regionDetected: boolean;
}

export function RegionDetectionWrapper({ regionDetected }: RegionDetectionWrapperProps) {
    const searchParams = useSearchParams();
    const [showRegionModal, setShowRegionModal] = useState(false);

    useEffect(() => {
        // Show modal only if: no region param AND detection failed
        const hasRegionParam = searchParams.has('region');
        if (!hasRegionParam && !regionDetected) {
            setShowRegionModal(true);
        }
    }, [searchParams, regionDetected]);

    return (
        <>
            <RegionSelectionModal
                open={showRegionModal}
                onClose={() => setShowRegionModal(false)}
            />

            {/* "Wrong region?" link for manual override */}
            <div className="mt-6 text-center">
                <button
                    onClick={() => setShowRegionModal(true)}
                    className="text-xs text-[rgba(143,130,255,0.75)] hover:text-[rgba(143,130,255,1)] underline-offset-4 hover:underline transition-colors"
                >
                    Wrong region? Change currency
                </button>
            </div>
        </>
    );
}
