import { Card, CardContent } from "@/components/ui/card";

export default async function DjSettingsPage() {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardContent className="py-12 text-center">
        <h2 className="text-lg font-semibold text-white">Profile Settings</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Coming soon in Phase 4
        </p>
      </CardContent>
    </Card>
  );
}
