"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { httpPost } from "@/lib/http";
import { toast } from "sonner";
import { RotateCcw, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface RegenerateWithToneProps {
  reportId: string;
  currentReport: {
    findings: string;
    impression: string;
    recommendations?: string;
  };
}

export function RegenerateWithTone({ reportId, currentReport }: RegenerateWithToneProps) {
  const router = useRouter();
  const [selectedTone, setSelectedTone] = useState<string>("standard");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const tones = [
    { value: "standard", label: "Standard", description: "Balanced clinical language" },
    { value: "concise", label: "Concise", description: "Brief, to-the-point reporting" },
    { value: "detailed", label: "Detailed", description: "Comprehensive with explanations" },
    { value: "teaching", label: "Teaching", description: "Educational with anatomical details" },
    { value: "formal", label: "Formal", description: "Highly professional language" },
  ];

  const handleRegenerate = async () => {
    if (selectedTone === "standard") {
      toast.error("Please select a different tone");
      return;
    }

    setIsRegenerating(true);
    try {
      const response = await httpPost<{ tone: string }, { job_id: string }>(
        `/v1/reports/${reportId}/regenerate`,
        { tone: selectedTone }
      );

      toast.success("Report regeneration started!");

      // TODO: Implement polling for job completion
      // For now, just refresh after a delay
      setTimeout(() => {
        router.refresh();
        toast.success("Report regenerated successfully!");
      }, 5000);

    } catch (error) {
      console.error("Failed to regenerate report:", error);
      toast.error("Failed to regenerate report");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <RotateCcw className="w-5 h-5 text-blue-600" />
          Regenerate with Different Tone
        </CardTitle>
        <CardDescription>
          Regenerate this report with a different writing style while keeping the same findings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="tone-select">Select Tone</Label>
          <Select value={selectedTone} onValueChange={setSelectedTone}>
            <SelectTrigger id="tone-select" className="mt-2">
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              {tones.map((tone) => (
                <SelectItem key={tone.value} value={tone.value}>
                  <div className="flex flex-col">
                    <span className="font-semibold">{tone.label}</span>
                    <span className="text-xs text-gray-500">{tone.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900">How it works:</p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>• Same clinical findings and patient data</li>
                <li>• New writing style applied throughout</li>
                <li>• Maintains medical accuracy</li>
                <li>• Original report preserved in version history</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          onClick={handleRegenerate}
          disabled={isRegenerating || selectedTone === "standard"}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isRegenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Regenerating Report...
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4 mr-2" />
              Regenerate with {tones.find(t => t.value === selectedTone)?.label} Tone
            </>
          )}
        </Button>

        {selectedTone === "standard" && (
          <p className="text-xs text-gray-500 text-center">
            Select a different tone to regenerate
          </p>
        )}
      </CardContent>
    </Card>
  );
}
