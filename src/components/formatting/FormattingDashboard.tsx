"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Upload,
  FileText,
  MoreVertical,
  Star,
  Edit2,
  Trash2,
  Eye,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormattingProfiles } from '@/hooks/useFormattingProfiles';
import { UploadTemplateDialog } from './UploadTemplateDialog';
import { ProfileDetail } from './ProfileDetail';
import { FormattingProfile } from '@/lib/api/formatting';

export function FormattingDashboard() {
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<FormattingProfile | null>(null);

  const { data, isLoading, error, refetch } = useFormattingProfiles();

  const profiles = data?.profiles || [];
  const totalProfiles = data?.total || 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const apiError = error as { status?: number; message?: string };
    const is403 = apiError.status === 403;

    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-6 h-6" />
              {is403 ? 'Upgrade Required' : 'Error Loading Profiles'}
            </CardTitle>
            <CardDescription className="text-red-700">
              {is403
                ? 'Custom formatting is available for Professional and Premium tier users.'
                : apiError.message || 'Failed to load formatting profiles. Please try again.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {is403 ? (
              <Button
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                onClick={() => (window.location.href = '/pricing')}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                View Pricing
              </Button>
            ) : (
              <Button onClick={() => refetch()}>Try Again</Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show selected profile detail view
  if (selectedProfile) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelectedProfile(null)}>
          ← Back to Profiles
        </Button>
        <ProfileDetail profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      </div>
    );
  }

  // Empty state
  if (totalProfiles === 0) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">No Formatting Profiles Yet</CardTitle>
              <CardDescription className="text-base">
                Upload a DOCX template to create your first custom formatting profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <Button
                  size="lg"
                  onClick={() => setUploadDialogOpen(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Your First Template
                </Button>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2 text-sm">Getting Started</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Prepare a DOCX file with your desired formatting styles</li>
                  <li>• Upload the template to extract formatting configuration</li>
                  <li>• Set a profile as default to use it for all exports</li>
                  <li>• Create up to 10 different formatting profiles</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <UploadTemplateDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onSuccess={() => refetch()}
        />
      </>
    );
  }

  // Main dashboard with profiles
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Custom Formatting Profiles</h2>
            <p className="text-gray-600 mt-1">
              Manage your report formatting templates ({totalProfiles} / 10)
            </p>
          </div>
          <Button
            onClick={() => setUploadDialogOpen(true)}
            disabled={totalProfiles >= 10}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Template
          </Button>
        </div>

        {/* Profile limit warning */}
        {totalProfiles >= 10 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-900">
                Profile Limit Reached
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                You&apos;ve reached the maximum of 10 formatting profiles. Delete an existing
                profile to upload a new one.
              </p>
            </div>
          </motion.div>
        )}

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {profiles.map((profile, index) => (
              <motion.div
                key={profile.profile_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-2 hover:border-emerald-500 transition-all hover:shadow-lg group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          {profile.is_default && (
                            <Badge className="bg-emerald-100 text-emerald-700">
                              <Star className="w-3 h-3 mr-1 fill-emerald-700" />
                              Default
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg truncate">
                          {profile.profile_name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Created: {formatDate(profile.created_at)}
                        </CardDescription>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-4 h-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedProfile(profile)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              // Handled by ProfileDetail component
                              setSelectedProfile(profile);
                            }}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          {!profile.is_default && (
                            <DropdownMenuItem
                              onClick={() => {
                                // Handled by ProfileDetail component
                                setSelectedProfile(profile);
                              }}
                            >
                              <Star className="w-4 h-4 mr-2" />
                              Set as Default
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              // Handled by ProfileDetail component
                              setSelectedProfile(profile);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <UploadTemplateDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSuccess={() => refetch()}
      />
    </>
  );
}
