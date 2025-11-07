"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { httpPost, httpGet } from "@/lib/http";
import { toast } from "sonner";
import { MessageSquare, Send, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useJobStatusPolling } from "@/hooks/useSafePolling";

interface RefineFindingsProps {
  reportId: string;
  sections: {
    findings: string;
    impression: string;
    recommendations?: string;
  };
}

export function RefineFindings({ reportId, sections }: RefineFindingsProps) {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const jobIdRef = useRef<string | null>(null);

  const sectionOptions = [
    { value: "findings", label: "Findings", description: "Main observations and measurements" },
    { value: "impression", label: "Impression", description: "Clinical interpretation and diagnosis" },
    { value: "recommendations", label: "Recommendations", description: "Follow-up suggestions" },
  ];

  // Poll for job completion
  const { isPolling } = useJobStatusPolling(
    async () => {
      if (!jobIdRef.current) return;

      try {
        const response = await httpGet<{ status: string }>(
          `/v1/jobs/${jobIdRef.current}`
        );

        if (response.status === "completed") {
          // Job completed successfully
          router.refresh();
          toast.success(
            `${selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)} section refined successfully!`
          );
          setRefinementPrompt("");
          setSelectedSection("");
          setJobId(null);
          jobIdRef.current = null;
          // Stop polling by returning (hook detects job completion)
          throw new Error("Job completed");
        }
      } catch (error) {
        // If we get a 404 or other error, the job may have completed already
        // This will trigger cleanup
        throw error;
      }
    },
    {
      pauseWhenHidden: true,
      immediate: false, // Don't poll until we have a job ID
      cleanupOnError: false, // Don't stop polling on transient errors
    }
  );

  const handleRefine = async () => {
    if (!selectedSection || !refinementPrompt.trim()) {
      toast.error("Please select a section and provide refinement instructions");
      return;
    }

    setIsRefining(true);
    try {
      const response = await httpPost<
        { section: string; refinement_prompt: string },
        { job_id: string }
      >(`/v1/reports/${reportId}/refine`, {
        section: selectedSection,
        refinement_prompt: refinementPrompt,
      });

      const newJobId = response.job_id;
      jobIdRef.current = newJobId;
      setJobId(newJobId);

      toast.success("Section refinement started! Polling for completion...");
    } catch (error) {
      console.error("Failed to refine section:", error);
      toast.error("Failed to refine section");
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <Card className="border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="w-5 h-5 text-green-600" />
          Refine Report Section
        </CardTitle>
        <CardDescription>
          Provide feedback to improve a specific section of your report
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="section-select">Select Section to Refine</Label>
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger id="section-select" className="mt-2">
              <SelectValue placeholder="Choose section" />
            </SelectTrigger>
            <SelectContent>
              {sectionOptions.map((section) => (
                <SelectItem key={section.value} value={section.value}>
                  <div className="flex flex-col">
                    <span className="font-semibold">{section.label}</span>
                    <span className="text-xs text-gray-500">{section.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSection && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-2 font-semibold uppercase">Current {selectedSection}:</p>
            <p className="text-sm text-gray-800 line-clamp-4">
              {sections[selectedSection as keyof typeof sections]}
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="refinement-prompt">What would you like to change?</Label>
          <Textarea
            id="refinement-prompt"
            value={refinementPrompt}
            onChange={(e) => setRefinementPrompt(e.target.value)}
            placeholder="Example: 'Make the impression more concise' or 'Add differential diagnoses for the nodule' or 'Include comparison with prior studies'"
            rows={5}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-2">
            Be specific about what you want the AI to improve or change
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-900">Example Refinement Prompts:</p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                <li>• "Make the language more concise and professional"</li>
                <li>• "Add differential diagnoses with likelihood"</li>
                <li>• "Include Fleischner Society recommendations"</li>
                <li>• "Emphasize the urgent findings more clearly"</li>
                <li>• "Use bullet points instead of paragraphs"</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          onClick={handleRefine}
          disabled={!selectedSection || !refinementPrompt.trim() || isRefining}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isRefining ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Refining {selectedSection}...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Refine {selectedSection || "Section"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
