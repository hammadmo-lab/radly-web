"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Edit2,
  Trash2,
  Star,
  Check,
  X,
  AlignLeft,
  Type,
  List,
  Hash,
} from 'lucide-react';
import { FormattingProfile } from '@/lib/api/formatting';
import { useUpdateProfile, useDeleteProfile, useSetDefaultProfile } from '@/hooks/useFormattingProfiles';
import { toast } from 'sonner';

interface ProfileDetailProps {
  profile: FormattingProfile;
  onClose?: () => void;
}

export function ProfileDetail({ profile, onClose }: ProfileDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(profile.profile_name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateMutation = useUpdateProfile();
  const deleteMutation = useDeleteProfile();
  const setDefaultMutation = useSetDefaultProfile();

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error('Profile name cannot be empty');
      return;
    }

    if (editedName.trim() === profile.profile_name) {
      setIsEditing(false);
      return;
    }

    await updateMutation.mutateAsync({
      profileId: profile.profile_id,
      data: { profile_name: editedName.trim() },
    });

    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(profile.profile_id);
    setShowDeleteConfirm(false);
    onClose?.();
  };

  const handleSetDefault = async () => {
    await setDefaultMutation.mutateAsync(profile.profile_id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderSectionConfig = (
    title: string,
    icon: React.ReactNode,
    config: Record<string, unknown> | undefined
  ) => {
    if (!config || Object.keys(config).length === 0) {
      return null;
    }

    const fontName = config.font_name as string | undefined;
    const fontSize = config.font_size as number | undefined;
    const bold = config.bold as boolean | undefined;
    const italic = config.italic as boolean | undefined;
    const uppercase = config.uppercase as boolean | undefined;
    const alignment = config.alignment as string | undefined;
    const spacingBefore = config.spacing_before as number | undefined;
    const spacingAfter = config.spacing_after as number | undefined;
    const bulletCharacter = config.bullet_character as string | undefined;
    const numberingFormat = config.numbering_format as string | undefined;
    const indent = config.indent as number | undefined;
    const style = config.style as string | undefined;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {icon}
          <h4 className="font-semibold text-sm">{title}</h4>
        </div>
        <div className="grid grid-cols-2 gap-3 pl-6">
          {fontName && (
            <div>
              <Label className="text-xs text-gray-500">Font</Label>
              <p className="text-sm font-medium">{fontName}</p>
            </div>
          )}
          {fontSize && (
            <div>
              <Label className="text-xs text-gray-500">Size</Label>
              <p className="text-sm font-medium">{fontSize}pt</p>
            </div>
          )}
          {bold !== undefined && (
            <div>
              <Label className="text-xs text-gray-500">Bold</Label>
              <p className="text-sm font-medium">{bold ? 'Yes' : 'No'}</p>
            </div>
          )}
          {italic !== undefined && (
            <div>
              <Label className="text-xs text-gray-500">Italic</Label>
              <p className="text-sm font-medium">{italic ? 'Yes' : 'No'}</p>
            </div>
          )}
          {uppercase !== undefined && (
            <div>
              <Label className="text-xs text-gray-500">Uppercase</Label>
              <p className="text-sm font-medium">{uppercase ? 'Yes' : 'No'}</p>
            </div>
          )}
          {alignment && (
            <div>
              <Label className="text-xs text-gray-500">Alignment</Label>
              <p className="text-sm font-medium capitalize">{alignment}</p>
            </div>
          )}
          {spacingBefore !== undefined && (
            <div>
              <Label className="text-xs text-gray-500">Spacing Before</Label>
              <p className="text-sm font-medium">{spacingBefore}pt</p>
            </div>
          )}
          {spacingAfter !== undefined && (
            <div>
              <Label className="text-xs text-gray-500">Spacing After</Label>
              <p className="text-sm font-medium">{spacingAfter}pt</p>
            </div>
          )}
          {bulletCharacter && (
            <div>
              <Label className="text-xs text-gray-500">Bullet</Label>
              <p className="text-sm font-medium">{bulletCharacter}</p>
            </div>
          )}
          {numberingFormat && (
            <div>
              <Label className="text-xs text-gray-500">Numbering</Label>
              <p className="text-sm font-medium">{numberingFormat}</p>
            </div>
          )}
          {indent !== undefined && (
            <div>
              <Label className="text-xs text-gray-500">Indent</Label>
              <p className="text-sm font-medium">{indent}pt</p>
            </div>
          )}
          {style && (
            <div className="col-span-2">
              <Label className="text-xs text-gray-500">Style Name</Label>
              <p className="text-sm font-medium">{style}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="max-w-xs"
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveName} disabled={updateMutation.isPending}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditedName(profile.profile_name);
                      setIsEditing(false);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-emerald-600" />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {profile.profile_name}
                      {profile.is_default && (
                        <Badge className="bg-emerald-100 text-emerald-700">
                          <Star className="w-3 h-3 mr-1 fill-emerald-700" />
                          Default
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Created: {formatDate(profile.created_at)}
                      {profile.updated_at !== profile.created_at && (
                        <> • Updated: {formatDate(profile.updated_at)}</>
                      )}
                    </CardDescription>
                  </div>
                </div>
              )}
            </div>

            {!isEditing && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-1" />
                  Rename
                </Button>
                {!profile.is_default && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSetDefault}
                    disabled={setDefaultMutation.isPending}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Set Default
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Separator />

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Formatting Configuration</h3>

            <div className="grid gap-6">
              {renderSectionConfig(
                'Patient Information',
                <Type className="w-4 h-4 text-blue-600" />,
                profile.formatting_config.patient_info
              )}

              {renderSectionConfig(
                'Report Title',
                <AlignLeft className="w-4 h-4 text-violet-600" />,
                profile.formatting_config.report_title
              )}

              {renderSectionConfig(
                'Section Headers',
                <AlignLeft className="w-4 h-4 text-emerald-600" />,
                profile.formatting_config.section_headers
              )}

              {renderSectionConfig(
                'Findings',
                <List className="w-4 h-4 text-orange-600" />,
                profile.formatting_config.findings
              )}

              {renderSectionConfig(
                'Impression',
                <Hash className="w-4 h-4 text-red-600" />,
                profile.formatting_config.impression
              )}

              {renderSectionConfig(
                'Recommendations',
                <List className="w-4 h-4 text-teal-600" />,
                profile.formatting_config.recommendations
              )}

              {renderSectionConfig(
                'Signature',
                <Type className="w-4 h-4 text-gray-600" />,
                profile.formatting_config.signature
              )}
            </div>
          </div>

          {onClose && (
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Formatting Profile?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{profile.profile_name}&quot;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Profile'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
