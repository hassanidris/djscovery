import { BriefcaseBusiness } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ProfessionalTeamSidebarProps {
  managerName: string;
  managerEmail: string;
  agentName: string;
  agentAgency: string;
  agentEmail: string;
}

export default function ProfessionalTeamSidebar({
  managerName,
  managerEmail,
  agentName,
  agentAgency,
  agentEmail,
}: ProfessionalTeamSidebarProps) {
  if (!managerName && !agentName) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
        <BriefcaseBusiness className="text-h_redLight h-3 w-3" />
        Professional Team
      </h3>
      <div className="flex flex-col gap-2">
        {managerName && (
          <Card className="bg-h_blackLight/30 gap-0 border-white/8 p-3">
            <p className="mb-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              Manager
            </p>
            <p className="text-xs font-semibold text-white">{managerName}</p>
            {managerEmail && (
              <a
                href={`mailto:${managerEmail}`}
                className="hover:text-h_redLight mt-0.5 block truncate text-xs text-gray-400 transition-colors"
              >
                {managerEmail}
              </a>
            )}
          </Card>
        )}
        {agentName && (
          <Card className="bg-h_blackLight/30 gap-0 border-white/8 p-3">
            <p className="mb-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              Booking Agent
            </p>
            <p className="text-xs font-semibold text-white">{agentName}</p>
            {agentAgency && (
              <p className="mt-0.5 text-[11px] text-gray-400">{agentAgency}</p>
            )}
            {agentEmail && (
              <a
                href={`mailto:${agentEmail}`}
                className="hover:text-h_redLight mt-0.5 block truncate text-xs text-gray-400 transition-colors"
              >
                {agentEmail}
              </a>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
