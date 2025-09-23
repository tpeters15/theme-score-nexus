-- Create signals table to store market intelligence data
CREATE TABLE public.signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signal_id TEXT NOT NULL UNIQUE,
  internal_id TEXT,
  topic_id TEXT,
  url TEXT,
  title TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL,
  type TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

-- Create policies for signals access
CREATE POLICY "Public read access for signals" 
ON public.signals 
FOR SELECT 
USING (true);

CREATE POLICY "Analysts and admins can create signals" 
ON public.signals 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Analysts and admins can update signals" 
ON public.signals 
FOR UPDATE 
USING (has_role(auth.uid(), 'analyst'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete signals" 
ON public.signals 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_signals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_signals_updated_at
BEFORE UPDATE ON public.signals
FOR EACH ROW
EXECUTE FUNCTION public.update_signals_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_signals_created_at ON public.signals(created_at DESC);
CREATE INDEX idx_signals_source ON public.signals(source);
CREATE INDEX idx_signals_type ON public.signals(type);
CREATE INDEX idx_signals_signal_id ON public.signals(signal_id);

-- Insert sample signals based on the provided data
INSERT INTO public.signals (signal_id, internal_id, topic_id, url, title, description, source, type, author, created_at, updated_at) VALUES
('sig_1758626263287_0', 'pitchbook-1758626263199-uinu0ctnp-collision-repair', 'pitchbookalert_collisionrepairacquisition_20250923', 'https://url.us.m.mimecastprotect.com/s/Eso1C68xJRC0QvxKSxtDt5QR4c', 'Collision Repair - Acquisition', 'Collision Repair was acquired for an undisclosed amount with close date of 19-Sep-2025. Provider of automotive body repair services designed to restore vehicle appearance and safety.', 'PitchBook Alert', 'email_alert', 'PitchBook', '2025-09-23T11:16:47Z', '2025-09-23T11:17:43.287Z'),
('sig_1758626143238_0', 'pitchbook-1758626143142-b6srq7og8-pricewaterhousecoopers-(norway)-(audit-and-advisory-business)', 'pitchbookalert_pricewaterhousecoopersnorwayauditandadvisorybusinessacquisition_20250923', 'https://url.us.m.mimecastprotect.com/s/9XgoC4xv0RH9LOrPUVtZt4OMHB', 'PricewaterhouseCoopers (Norway) (Audit and Advisory Business) - Acquisition', 'PricewaterhouseCoopers (Norway) (Audit and Advisory Business) to be acquired by IK Partners for an undisclosed amount with anticipated close date of 15-Sep-2025. Provider of advisory and integrated business services intended for the local people of Norway.', 'PitchBook Alert', 'email_alert', 'PitchBook', '2025-09-23T11:14:43Z', '2025-09-23T11:15:43.238Z'),
('sig_1758625303264_0', 'pitchbook-1758625303165-53cqqjuuc-hubject', 'pitchbookalert_hubject_20250923', 'https://url.us.m.mimecastprotect.com/s/6sNJCjRg4qfGpXYEt1tZtmwJ3P', 'Hubject EV Charging Partnership', 'Hubject Teams with Blink Charging to Further Expand Intercharge Network Across North America. Operator of an e-roaming network platform intended to offer a seamless charging experience for electric vehicles from new mobility partners.', 'PitchBook Alert', 'email_alert', 'PitchBook', '2025-09-23T11:00:55Z', '2025-09-23T11:01:43.264Z'),
('sig_1758621873680_0', 'https://www.climatechangenews.com/2025/09/22/un-climate-chief-new-national-climate-plans-nds-short-emissions-cuts/', 'carbonbriefdaily_unclimatechiefsaysnewnationalplanswillfallshortonemissionscuts_20250923', 'https://www.climatechangenews.com/2025/09/22/un-climate-chief-new-national-climate-plans-nds-short-emissions-cuts/', 'UN climate chief says new national plans will fall short on emissions cuts', 'There is widespread media coverage of New York climate week and the UN general assembly, which are both taking place in New York this week. Climate Home News reports that countries'' new national climate plans (NDCs) for 2035 are "expected to be too weak to meet global goals"...', 'Carbon Brief Daily', 'html', 'Climate Home News', '2025-09-23T00:00:00.000Z', '2025-09-23T10:04:33.680Z'),
('sig_1758621873680_1', 'https://www.reuters.com/sustainability/climate-energy/us-court-weighs-trump-halt-rhode-island-offshore-wind-project-2025-09-22/', 'carbonbriefdaily_usjudgerulestrumpcannotblockrhodeislandoffshorewindproject_20250923', 'https://www.reuters.com/sustainability/climate-energy/us-court-weighs-trump-halt-rhode-island-offshore-wind-project-2025-09-22/', 'US judge rules Trump cannot block Rhode Island offshore wind project', 'A federal judge has ruled that Danish offshore wind developer Ørsted can restart work on its $6.2bn "Revolution Wind" project, after the Trump administration ordered construction to stop last month...', 'Carbon Brief Daily', 'html', 'Reuters', '2025-09-23T00:00:00.000Z', '2025-09-23T10:04:33.680Z'),
('sig_1758621873680_2', 'https://www.politico.eu/article/lib-dems-ditch-2045-net-zero-target/', 'carbonbriefdaily_uklibdemsditchflagship2045netzeropolicy_20250923', 'https://www.politico.eu/article/lib-dems-ditch-2045-net-zero-target/', 'UK Lib Dems ditch flagship 2045 net-zero policy', '"The Liberal Democrats have scrapped their 2045 net-zero target and aligned with the Labour government''s 2050 goal instead," Politico reports. The outlet says that at the party''s annual conference...', 'Carbon Brief Daily', 'html', 'Politico', '2025-09-23T00:00:00.000Z', '2025-09-23T10:04:33.680Z'),
('sig_1758621663476_0', 'https://www.bloomberg.com/news/articles/2025-09-23/eu-proposes-another-one-year-delay-to-landmark-deforestation-law', 'bloomberggreen_euproposesanotherdelaytolandmarkdeforestationlaw_20250923', 'https://www.bloomberg.com/news/articles/2025-09-23/eu-proposes-another-one-year-delay-to-landmark-deforestation-law', 'EU Proposes Another Delay to Landmark Deforestation Law', 'The European Commission, the bloc''s executive branch, will seek to again delay the implementation of its landmark law to tackle deforestation, according to Jessika Roswall, the bloc''s environment commissioner.', 'Bloomberg Green', 'rss', 'John Ainger', '2025-09-23T09:40:37.000Z', '2025-09-23T10:01:03.476Z'),
('sig_1758621663476_1', 'https://www.bloomberg.com/news/articles/2025-09-23/australian-government-strikes-battery-deal-with-akaysha-as-snowy-2-0-stalls', 'bloomberggreen_australiangovernmentstrikesbatteryofftakedealaspumpedhydrostalls_20250923', 'https://www.bloomberg.com/news/articles/2025-09-23/australian-government-strikes-battery-deal-with-akaysha-as-snowy-2-0-stalls', 'Australian Government Strikes Battery Offtake Deal as Pumped Hydro Stalls', 'Australia''s Snowy Hydro Ltd. struck a deal to use a battery being developed by a Blackrock Inc. unit in a bid to manage the country''s rampant power market volatility as it shifts to more intermittent renewable sources.', 'Bloomberg Green', 'rss', 'Keira Wright', '2025-09-23T08:57:50.000Z', '2025-09-23T10:01:03.476Z');