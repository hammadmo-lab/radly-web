'use client';

import { Globe } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RegionSelectionModalProps {
    open: boolean;
    onClose: () => void;
}

export function RegionSelectionModal({ open, onClose }: RegionSelectionModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(38,83,255,0.15)]">
                            <Globe className="h-8 w-8 text-[rgba(75,142,255,0.9)]" />
                        </div>
                    </div>
                    <DialogTitle className="text-center text-2xl">Select Your Region</DialogTitle>
                    <DialogDescription className="text-center text-base pt-2">
                        Please select your region to view pricing in your local currency.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-3">
                    <Link href="/pricing?region=egypt" onClick={onClose} className="block">
                        <Button variant="outline" className="w-full h-auto py-4 justify-start">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🇪🇬</span>
                                <div className="text-left">
                                    <div className="font-semibold">Egypt (EGP)</div>
                                    <div className="text-xs text-muted-foreground">Pricing in Egyptian Pounds</div>
                                </div>
                            </div>
                        </Button>
                    </Link>

                    <Link href="/pricing?region=international" onClick={onClose} className="block">
                        <Button variant="outline" className="w-full h-auto py-4 justify-start">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🌍</span>
                                <div className="text-left">
                                    <div className="font-semibold">International (USD)</div>
                                    <div className="text-xs text-muted-foreground">Pricing in US Dollars</div>
                                </div>
                            </div>
                        </Button>
                    </Link>
                </div>

                <p className="text-xs text-center text-[rgba(207,207,207,0.55)]">
                    Your selection will be applied immediately.
                </p>
            </DialogContent>
        </Dialog>
    );
}
