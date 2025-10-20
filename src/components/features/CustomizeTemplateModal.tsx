"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { httpPost, httpGet } from "@/lib/http";
import { toast } from "sonner";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";

interface CustomizeTemplateModalProps {
  templateId: string;
  templateName: string;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export function CustomizeTemplateModal({
  templateId,
  templateName,
  isOpen,
  onClose,
  onSaved,
}: CustomizeTemplateModalProps) {
  const [customInstructions, setCustomInstructions] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load existing custom instructions when modal opens
  useEffect(() => {
    if (isOpen && templateId) {
      loadCustomInstructions();
    }
  }, [isOpen, templateId]);

  const loadCustomInstructions = async () => {
    setIsLoading(true);
    try {
      const data = await httpGet<{ instructions: string }>(`/v1/templates/${templateId}/custom-instructions`);
      setCustomInstructions(data.instructions || "");
      setHasChanges(false);
    } catch (error) {
      // No custom instructions yet or error fetching
      setCustomInstructions("");
      setHasChanges(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await httpPost(`/v1/templates/${templateId}/custom-instructions`, {
        instructions: customInstructions,
      });
      toast.success("Custom instructions saved successfully!");
      setHasChanges(false);
      onSaved?.();
      onClose();
    } catch (error) {
      console.error("Failed to save custom instructions:", error);
      toast.error("Failed to save custom instructions");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (value: string) => {
    setCustomInstructions(value);
    setHasChanges(true);
  };

  const handleClose = () => {
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Customize Template: {templateName}
          </DialogTitle>
          <DialogDescription>
            Add custom instructions that will automatically apply every time you use this template
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="instructions" className="text-base font-semibold">
                Custom Instructions
              </Label>
              <Textarea
                id="instructions"
                value={customInstructions}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="Add custom instructions that will be applied every time you use this template. Example: 'Always include comparison with prior studies' or 'Use metric measurements only'"
                rows={10}
                className="mt-2 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                These instructions will be automatically included in the AI prompt when generating reports with this template
              </p>
            </div>

            {/* Examples Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Example Instructions:</p>
                </div>
              </div>
              <ul className="text-sm text-gray-700 space-y-2 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>"Always mention the presence or absence of lymphadenopathy in all scans"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>"Include Fleischner Society recommendations for pulmonary nodules"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>"Use concise language and bullet points for findings section"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>"Compare all measurements with prior studies when relevant"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>"Always include ACR appropriateness criteria references"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>"Use teaching file format with detailed anatomical descriptions"</span>
                </li>
              </ul>
            </div>

            {/* Tips Section */}
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-green-700">Tip:</span> Keep instructions specific and actionable. The AI will follow these preferences for every report generated with this template.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges || isLoading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>Save Instructions</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
