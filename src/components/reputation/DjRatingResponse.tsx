"use client";

import { useState } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  createReviewResponse,
  updateReviewResponse,
  deleteReviewResponse,
} from "@/lib/actions/dj-rating-response";
import { useUser } from "@/lib/supabase/useUser";
import { toast } from "sonner";

interface DjRatingResponseProps {
  ratingId: number;
  djProfileId: number;
  existingResponse?: string | null;
  respondedAt?: Date | null;
  djName?: string;
}

export function DjRatingResponse({
  ratingId,
  djProfileId,
  existingResponse,
  respondedAt,
  djName,
}: DjRatingResponseProps) {
  const [isEditing, setIsEditing] = useState(!existingResponse);
  const [response, setResponse] = useState(existingResponse || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  async function handleSubmit() {
    if (response.length < 10) {
      toast.error("Response must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = existingResponse
        ? await updateReviewResponse({ ratingId, response })
        : await createReviewResponse({ ratingId, response });

      if (result.success) {
        toast.success("Response saved successfully");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Failed to save response");
      }
    } catch (error) {
      toast.error("Failed to save response");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setIsSubmitting(true);
    try {
      const result = await deleteReviewResponse(ratingId);
      if (result.success) {
        toast.success("Response deleted");
        setResponse("");
        setIsEditing(true);
      } else {
        toast.error(result.error || "Failed to delete response");
      }
    } catch (error) {
      toast.error("Failed to delete response");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!user) {
    return null;
  }

  if (isEditing) {
    return (
      <Card className="bg-h_blackLight/30 mt-3 border-white/5 p-4">
        <div className="flex items-start gap-2">
          <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-blue-400" />
          <div className="flex-1">
            <p className="mb-2 text-xs font-medium text-white">
              {djName ? `Response from ${djName}` : "DJ Response"}
            </p>
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Thank you for your review! (min 10 characters)"
              className="mb-2 min-h-20 border-white/10 bg-white/5 text-white placeholder:text-gray-500"
              maxLength={1000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {response.length}/1000 characters
              </span>
              <div className="flex gap-2">
                {existingResponse && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setResponse(existingResponse);
                      setIsEditing(false);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting || response.length < 10}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="mr-1 h-3.5 w-3.5" />
                  {isSubmitting ? "Saving..." : "Send Response"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-h_blackLight/30 mt-3 border-white/5 p-4">
      <div className="flex items-start gap-2">
        <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-blue-400" />
        <div className="flex-1">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-white">
              {djName ? `Response from ${djName}` : "DJ Response"}
            </p>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-6 px-2 text-xs text-gray-400 hover:text-white"
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="h-6 px-2 text-xs text-gray-400 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-300">{response}</p>
          {respondedAt && (
            <p className="mt-2 text-xs text-gray-500">
              Responded {new Date(respondedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
