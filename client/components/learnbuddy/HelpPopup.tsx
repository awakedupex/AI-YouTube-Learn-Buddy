import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HelpPopup({ text, onAccept, onClose }: { text: string; onAccept: () => void; onClose: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-3">
      <Card className="w-full max-w-lg border-2">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="font-medium">Need help with this part?</div>
            <p className="text-sm text-foreground/70">We noticed a few rewinds here. Want a simpler explanation?</p>
            <div className="flex gap-3 pt-2">
              <Button onClick={onAccept}>Explain</Button>
              <Button variant="secondary" onClick={onClose}>Not now</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
