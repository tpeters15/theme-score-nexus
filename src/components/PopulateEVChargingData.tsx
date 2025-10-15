import { useEffect, useState } from "react";
import { populateThemeData } from "@/utils/populateThemeData";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

export function PopulateEVChargingData() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePopulate = async () => {
    setLoading(true);
    try {
      await populateThemeData({
        themeName: "EV Charging Infrastructure",
        tam: {
          value_gbp_bn: 80,
          confidence: "MEDIUM",
          variance_percent: 15
        },
        cagr: {
          value_percent: 21,
          period: "2024-2030",
          confidence: "MEDIUM"
        },
        market_maturity: "TRANSITIONING",
        regulations: [
          {
            regulation_name: "Regulation (EU) 2023/1804 on Deployment of Alternative Fuels Infrastructure (AFIR)",
            official_reference: "Regulation (EU) 2023/1804",
            jurisdiction: "EU",
            status: "in_force",
            official_source_url: "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A02023R1804-20250414",
            core_requirement: "Member States must meet strict EV charging-rollout targets on the TEN-T network and urban areas with incremental targets each year from 2024 through 2030. Charging stations must also be \"smart\" and connected via national data platforms.",
            compliance_deadline: "2030-12-31",
            impact_on_theme: "HIGH",
            commercial_implication: "Strong incentive to invest in charging networks; member states will be pushing that build-out aggressively. Projects aligned with AFIR targets can rely on legal \"must-build\" demand."
          },
          {
            regulation_name: "The Building etc. (Amendment) (England) (No. 2) Regulations 2022 (SI 2022/984)",
            official_reference: "SI 2022/984",
            jurisdiction: "UK",
            status: "in_force",
            official_source_url: "",
            core_requirement: "All new residential dwellings must have one chargepoint per home; new non-residential buildings with >10 parking spaces must install EV chargepoints on 20% of spaces and EV-ready wiring on all spaces.",
            compliance_deadline: "2022-06-30",
            impact_on_theme: "HIGH",
            commercial_implication: "Mandatory demand for chargers in construction, driving adoption of chargepoint supply in building sector and raising underlying market size."
          },
          {
            regulation_name: "The Electric Vehicles (Smart Charge Points) Regulations 2021",
            official_reference: "The Electric Vehicles (Smart Charge Points) Regulations 2021",
            jurisdiction: "UK",
            status: "in_force",
            official_source_url: "",
            core_requirement: "All new home and workplace chargers must be \"smart\"—capable of receiving tariffs and responding. From 1 July 2022 all new private chargepoints must meet technical \"smart\" standards; large public and workplace chargepoints have staggered deadlines.",
            compliance_deadline: "2025-04-30",
            impact_on_theme: "MEDIUM",
            commercial_implication: "Adds compliance cost to chargers (favoring higher-end CPOs) and integrates EV charging load management into energy markets, but does not by itself drive large additional volume of chargers."
          },
          {
            regulation_name: "Ladesäulenverordnung (LSV)",
            official_reference: "Ladesäulenverordnung (LSV)",
            jurisdiction: "DE",
            status: "in_force",
            official_source_url: "",
            core_requirement: "Price transparency (publish €/kWh and €/minute), standardized billing information, mandatory smart-metering or equivalent on new chargers, and grid-access priority settings for chargers.",
            compliance_deadline: "2023-12-31",
            impact_on_theme: "MEDIUM",
            commercial_implication: "Creates some compliance work for operators but also levels the playing field. It indirectly supports investment by clarifying rules and requiring open-access networks."
          },
          {
            regulation_name: "Ladeinfrastrukturgesetz (LadInfraG 2023)",
            official_reference: "Ladeinfrastrukturgesetz (LadInfraG 2023)",
            jurisdiction: "DE",
            status: "in_force",
            official_source_url: "",
            core_requirement: "Tenants have a right to request a charger, planning/regulatory barriers are reduced, and reference values for connection capacity are set.",
            compliance_deadline: "2023-07-31",
            impact_on_theme: "MEDIUM",
            commercial_implication: "Lowers soft-costs of installation and may open new retrofit markets. Helps unlock private-sector investment by making permitting faster."
          }
        ],
        scores: {
          A1_tam: 5,
          A2_som: 5,
          A3_cagr: 5,
          A4_maturity: 3,
          B1_fragmentation: 5,
          B2_competitive_moat: 3,
          B3_exit_quality: 3,
          C1_regulatory: 5,
          C2_timing_risk: 5,
          C3_macro_sensitivity: 3,
          C4_confidence: 3
        },
        score_justifications: {
          A1_tam: "€80bn significantly exceeds the €5bn threshold for expansive market classification",
          A2_som: "€2.2bn PE-addressable SOM substantially exceeds the €0.3bn threshold for high potential classification",
          A3_cagr: "21% CAGR significantly exceeds the 10% threshold for rapid growth classification",
          A4_maturity: "Transitioning maturity directly maps to the growth phase rubric (mix of VC and early PE activity)",
          B1_fragmentation: "High fragmentation with top 3 holding only 10.5% share creates ideal structure for platform building and bolt-on acquisitions",
          B2_competitive_moat: "Moderate moat strength indicates medium competitive intensity with viable differentiation opportunities through switching costs or proprietary technology",
          B3_exit_quality: "Viable exit quality directly corresponds to medium exit environment with 2-5 relevant M&A transactions in recent years",
          C1_regulatory: "Only 35% compliance-driven demand falls well below the 40% threshold, indicating primarily ROI-driven market resilient to policy changes",
          C2_timing_risk: "Excellent timing with transitioning maturity, >15% CAGR, and strong regulatory support creates optimal PE investment window",
          C3_macro_sensitivity: "Mixed demand drivers with majority ROI-driven but significant discretionary component creates moderate cyclicality exposure",
          C4_confidence: "Mix of medium to medium-high confidence across critical research tools with no major data gaps represents manageable research concerns"
        }
      });

      toast({
        title: "Success",
        description: "EV Charging Infrastructure theme data populated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handlePopulate} disabled={loading}>
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Populate EV Charging Data
    </Button>
  );
}
