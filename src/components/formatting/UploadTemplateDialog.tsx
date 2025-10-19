"use client";

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Upload, FileText, CheckCircle } from 'lucide-react';
import { useUploadTemplate } from '@/hooks/useFormattingProfiles';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function UploadTemplateDialog({
  open,
  onOpenChange,
  onSuccess,
}: UploadTemplateDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [profileName, setProfileName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadTemplate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type
    if (!selectedFile.name.endsWith('.docx')) {
      setError('Only DOCX files are accepted');
      setFile(null);
      return;
    }

    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!profileName.trim()) {
      setError('Please enter a profile name');
      return;
    }

    if (profileName.length > 255) {
      setError('Profile name must be less than 255 characters');
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        file,
        profileName: profileName.trim(),
        isDefault,
      });

      // Reset form
      setFile(null);
      setProfileName('');
      setIsDefault(false);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Close dialog
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      // Error is already handled by the mutation hook with toast
      console.error('Upload error:', err);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setProfileName('');
    setIsDefault(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Upload className="w-4 h-4 text-white" />
            </div>
            Upload Template
          </DialogTitle>
          <DialogDescription>
            Upload a DOCX template to create a custom formatting profile for your reports.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">DOCX Template</Label>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".docx"
                  onChange={handleFileChange}
                  className="cursor-pointer file:cursor-pointer file:mr-4 file:px-4 file:py-2 file:rounded-md file:border-0 file:bg-emerald-500 file:text-white file:font-semibold hover:file:bg-emerald-600"
                />
              </div>

              {/* File Info */}
              <AnimatePresence>
                {file && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200"
                  >
                    <FileText className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-emerald-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-emerald-700">{formatFileSize(file.size)}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="text-xs text-gray-500">
              Maximum file size: 5MB. Accepted format: .docx
            </p>
          </div>

          {/* Profile Name */}
          <div className="space-y-2">
            <Label htmlFor="profile-name">Profile Name</Label>
            <Input
              id="profile-name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g., General Hospital Format"
              maxLength={255}
              className="border-2 focus:border-emerald-500"
            />
            <p className="text-xs text-gray-500">
              Give your formatting profile a descriptive name (1-255 characters)
            </p>
          </div>

          {/* Set as Default */}
          <div className="flex items-center space-x-2">
            <input
              id="is-default"
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <Label htmlFor="is-default" className="cursor-pointer text-sm font-normal">
              Set as default formatting profile
            </Label>
          </div>

          {/* Upload Progress */}
          {uploadMutation.isPending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Uploading and processing...</span>
                <span className="font-medium text-emerald-600">Processing</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full animate-pulse" style={{ width: '50%' }} />
              </div>
            </div>
          )}

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help Text */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 text-sm">Template Guidelines</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Use a properly formatted DOCX file with styles defined</li>
              <li>• The system will extract formatting from headings, paragraphs, and lists</li>
              <li>• Font names, sizes, colors, and spacing will be preserved</li>
              <li>• You can have up to 10 formatting profiles</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={uploadMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!file || !profileName.trim() || uploadMutation.isPending}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            {uploadMutation.isPending ? (
              <>Processing...</>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
