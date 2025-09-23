import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Research = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Research Library</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Centralized research library will provide access to all research documents, 
              intelligence memos, and analysis across themes with advanced search and filtering.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Research;