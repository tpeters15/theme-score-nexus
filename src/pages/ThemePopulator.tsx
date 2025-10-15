import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface ThemeOption { id: string; name: string; }
interface Criteria { id: string; code: string; name: string; description?: string | null }

const marketSchema = z.object({
  tam_value: z.coerce.number().positive("Enter a positive number").max(1_000_000, "Too large"),
  tam_currency: z.enum(["GBP","USD","EUR"]).default("GBP"),
  cagr_percentage: z.coerce.number().min(0).max(100),
  cagr_period_start: z.coerce.number().int().min(2000).max(2100),
  cagr_period_end: z.coerce.number().int().min(2000).max(2100),
  market_maturity: z.enum(["EMERGING","TRANSITIONING","MATURE"]).default("TRANSITIONING"),
}).refine((d)=> d.cagr_period_end > d.cagr_period_start, { message: "End must be after start", path: ["cagr_period_end"]});

type MarketForm = z.infer<typeof marketSchema>;

const confidenceOptions = ["High","Medium","Low"] as const;

type ScoreRow = {
  criteria_id: string;
  code: string;
  name: string;
  score: number | '';
  confidence: typeof confidenceOptions[number];
  notes: string;
};

export default function ThemePopulator() {
  const { toast } = useToast();
  const [themes, setThemes] = useState<ThemeOption[]>([]);
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [savingScores, setSavingScores] = useState(false);

  const form = useForm<MarketForm>({
    resolver: zodResolver(marketSchema),
    defaultValues: {
      tam_currency: "GBP",
      market_maturity: "TRANSITIONING",
      cagr_period_start: 2024,
      cagr_period_end: 2030,
      cagr_percentage: 10,
      tam_value: 1,
    }
  });

  useEffect(() => {
    document.title = "Theme Data Populator";
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [{ data: themeData, error: tErr }, { data: critData, error: cErr }] = await Promise.all([
          supabase.from('taxonomy_themes').select('id,name').order('name'),
          supabase.from('framework_criteria').select('id,code,name,description').order('code')
        ]);
        if (tErr) throw tErr; if (cErr) throw cErr;
        setThemes(themeData || []);
        // Only include quantitative scoring categories A-D
        setCriteria((critData || []).filter(c => /^[ABCD]/.test(c.code)));
      } catch (e: any) {
        toast({ title: 'Error', description: e.message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  // Prefill market form when a theme is chosen
  useEffect(() => {
    const fetchTheme = async () => {
      if (!selectedThemeId) return;
      const { data, error } = await supabase
        .from('taxonomy_themes')
        .select('tam_value,tam_currency,cagr_percentage,cagr_period_start,cagr_period_end,market_maturity')
        .eq('id', selectedThemeId)
        .maybeSingle();
      if (!error && data) {
        form.reset({
          tam_value: data.tam_value ?? 1,
          tam_currency: (data.tam_currency as MarketForm['tam_currency']) ?? 'GBP',
          cagr_percentage: data.cagr_percentage ?? 10,
          cagr_period_start: data.cagr_period_start ?? 2024,
          cagr_period_end: data.cagr_period_end ?? 2030,
          market_maturity: (data.market_maturity as MarketForm['market_maturity']) ?? 'TRANSITIONING'
        });
      }
    };
    fetchTheme();
  }, [selectedThemeId]);

  const scoreRows = useMemo<ScoreRow[]>(() => (
    criteria.map(c => ({
      criteria_id: c.id,
      code: c.code,
      name: c.name,
      score: '',
      confidence: 'Medium',
      notes: ''
    }))
  ), [criteria]);

  const [scores, setScores] = useState<ScoreRow[]>(scoreRows);
  useEffect(() => setScores(scoreRows), [scoreRows]);

  const saveMarket = form.handleSubmit(async (values) => {
    if (!selectedThemeId) {
      toast({ title: 'Select a theme', description: 'Choose a theme first.' });
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase
        .from('taxonomy_themes')
        .update({
          tam_value: values.tam_value,
          tam_currency: values.tam_currency,
          cagr_percentage: values.cagr_percentage,
          cagr_period_start: values.cagr_period_start,
          cagr_period_end: values.cagr_period_end,
          market_maturity: values.market_maturity,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedThemeId);
      if (error) throw error;
      toast({ title: 'Saved', description: 'Market data updated.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  });

  const saveScores = async () => {
    if (!selectedThemeId) {
      toast({ title: 'Select a theme', description: 'Choose a theme first.' });
      return;
    }
    try {
      setSavingScores(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be signed in');

      const rows = scores.filter(r => r.score !== '' && r.score !== undefined);
      for (const r of rows) {
        const { error } = await supabase.from('detailed_scores').upsert({
          theme_id: selectedThemeId,
          criteria_id: r.criteria_id,
          score: Number(r.score),
          confidence: r.confidence,
          notes: r.notes || null,
          updated_by: user.id,
          update_source: 'manual'
        });
        if (error) throw error;
      }
      toast({ title: 'Saved', description: `Saved ${rows.length} scores.` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSavingScores(false);
    }
  };

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Theme Data Populator</h1>
        <p className="text-muted-foreground">Add market data and framework scores to any theme.</p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Choose Theme</CardTitle>
          <CardDescription>Select a theme to edit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Theme</Label>
              <Select value={selectedThemeId} onValueChange={setSelectedThemeId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="market">
        <TabsList className="mb-4">
          <TabsTrigger value="market">Market Data</TabsTrigger>
          <TabsTrigger value="scores">Detailed Scores</TabsTrigger>
        </TabsList>

        <TabsContent value="market">
          <Card>
            <CardHeader>
              <CardTitle>Market Data</CardTitle>
              <CardDescription>TAM, CAGR, maturity</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={saveMarket}>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>TAM Value</Label>
                    <Input type="number" step="0.1" {...form.register('tam_value')} />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select value={form.watch('tam_currency')} onValueChange={(v)=>form.setValue('tam_currency', v as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Market Maturity</Label>
                    <Select value={form.watch('market_maturity')} onValueChange={(v)=>form.setValue('market_maturity', v as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMERGING">EMERGING</SelectItem>
                        <SelectItem value="TRANSITIONING">TRANSITIONING</SelectItem>
                        <SelectItem value="MATURE">MATURE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>CAGR %</Label>
                    <Input type="number" step="0.1" {...form.register('cagr_percentage')} />
                  </div>
                  <div>
                    <Label>CAGR Start Year</Label>
                    <Input type="number" {...form.register('cagr_period_start')} />
                  </div>
                  <div>
                    <Label>CAGR End Year</Label>
                    <Input type="number" {...form.register('cagr_period_end')} />
                  </div>
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Save Market Data
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Scores</CardTitle>
              <CardDescription>Enter scores for criteria A-D</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {scores.map((row, idx) => (
                  <div key={row.criteria_id} className="grid gap-3 md:grid-cols-12 items-start">
                    <div className="md:col-span-2">
                      <Label className="text-xs">Code</Label>
                      <div className="font-medium">{row.code}</div>
                    </div>
                    <div className="md:col-span-4">
                      <Label className="text-xs">Name</Label>
                      <div className="text-sm text-muted-foreground">{row.name}</div>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Score (1-5)</Label>
                      <Input type="number" min={1} max={5} value={row.score} onChange={(e)=>{
                        const v = e.target.value === '' ? '' : Number(e.target.value);
                        setScores(prev => prev.map((r,i)=> i===idx ? { ...r, score: v } : r));
                      }} />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Confidence</Label>
                      <Select value={row.confidence} onValueChange={(v)=> setScores(prev => prev.map((r,i)=> i===idx ? { ...r, confidence: v as any } : r))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {confidenceOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Notes</Label>
                      <Textarea rows={2} value={row.notes} onChange={(e)=> setScores(prev => prev.map((r,i)=> i===idx ? { ...r, notes: e.target.value } : r))} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-1">
                <Button onClick={saveScores} disabled={savingScores}>
                  {savingScores && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                  Save Scores
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
