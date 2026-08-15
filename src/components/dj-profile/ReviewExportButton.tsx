"use client";

import { useState } from "react";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportDjReviews, generateCSV, generateJSON } from "@/lib/actions/dj-rating-export";
import { toast } from "sonner";

interface ReviewExportButtonProps {
  djProfileId: number;
}

export function ReviewExportButton({ djProfileId }: ReviewExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport(format: "csv" | "json") {
    setIsExporting(true);
    try {
      const result = await exportDjReviews(djProfileId);

      if (!result.success) {
        toast.error(result.error || "Failed to export reviews");
        return;
      }

      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === "csv") {
        content = generateCSV(result.data);
        filename = `dj-reviews-${djProfileId}-${Date.now()}.csv`;
        mimeType = "text/csv";
      } else {
        content = generateJSON(result.data);
        filename = `dj-reviews-${djProfileId}-${Date.now()}.json`;
        mimeType = "application/json";
      }

      // Create download link
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Reviews exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Failed to export reviews");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          className="border-white/10 bg-white/5 hover:bg-white/10"
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          {isExporting ? "Exporting..." : "Export Reviews"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
