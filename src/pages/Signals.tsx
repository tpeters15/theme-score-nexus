import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Signals = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Signal Intelligence</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Signal intelligence dashboard will be integrated here to display collected signals 
              from your n8n pipeline, categorized by deals & exits, regulatory updates, 
              market news, and watchlist changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signals;