"use client"

import { useState } from 'react'
import { Copy, Check, AlertTriangle, Key } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface KeyRevealModalProps {
    isOpen: boolean
    onClose: () => void
    apiKey: string
    keyName: string
}

/**
 * One-time key reveal modal
 * Shows the full API key only once after creation
 * Includes copy-to-clipboard and warning about saving the key
 */
export function KeyRevealModal({ isOpen, onClose, apiKey, keyName }: KeyRevealModalProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(apiKey)
            setCopied(true)
            toast.success('API key copied to clipboard')
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            console.error('Failed to copy:', error)
            toast.error('Failed to copy to clipboard')
        }
    }

    const handleClose = () => {
        // Reset state and close
        setCopied(false)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5 text-[#3FBF8C]" />
                        API Key Created
                    </DialogTitle>
                    <DialogDescription>
                        Your new API key <strong>{keyName}</strong> has been created successfully.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Critical warning banner */}
                    <Alert variant="destructive" className="border-[rgba(255,107,107,0.35)] bg-[rgba(255,107,107,0.12)]">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-[#FFD1D1]">
                            <strong>Save this key now</strong> — it will never be shown again.
                            Store it securely; anyone with this key can access your account.
                        </AlertDescription>
                    </Alert>

                    {/* API Key display */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Your API Key
                        </label>
                        <div className="relative">
                            <div className="rounded-lg border border-[rgba(255,255,255,0.12)] bg-muted p-4 pr-14">
                                <code className="block break-all font-mono text-sm text-foreground">
                                    {apiKey}
                                </code>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 p-0"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-[#3FBF8C]" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This key starts with <code className="font-mono">{apiKey.substring(0, 12)}...</code>
                        </p>
                    </div>

                    {/* Usage hint */}
                    <div className="rounded-lg bg-muted p-3">
                        <p className="text-sm font-medium text-foreground">Usage</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Include this key in your API requests using the <code className="font-mono">x-api-key</code> header.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleCopy}
                        variant="outline"
                        className="mr-2"
                    >
                        {copied ? (
                            <>
                                <Check className="mr-2 h-4 w-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Key
                            </>
                        )}
                    </Button>
                    <Button onClick={handleClose}>
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
