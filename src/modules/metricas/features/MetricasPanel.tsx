import { Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMetricsData } from "../hooks/useMetricsData";
import { SystemStatus } from "../components/widgets/SystemStatus";
import {
  AlertsCard,
  LiveCounter,
  PassengersCard,
  NetworkEfficiency,
} from "../components/widgets/MetricCards";
import {
  GridStats,
  TopCongested,
  PeakHours,
  Recommendations,
} from "../components/widgets/MetricStats";

export function MetricasPanel() {
  const { stats, loading, avgCongestion, critical, high, topCongested } =
    useMetricsData();
  const { t } = useTranslation();

  if (loading)
    return (
      <div className="flex items-center justify-center py-8 text-primary">
        <Activity size={20} className="animate-pulse" />
        <span className="ml-2 text-sm">
          {t("metrics.loading")}
        </span>
      </div>
    );

  return (
    <div className="space-y-3">
      <SystemStatus avgCongestion={avgCongestion} />
      <AlertsCard critical={critical} high={high} />
      <LiveCounter />
      <PassengersCard avgCongestion={avgCongestion} />
      <NetworkEfficiency />
      <GridStats stats={stats} />
      <TopCongested items={topCongested} />
      <PeakHours />
      <Recommendations avgCongestion={avgCongestion} />
    </div>
  );
}
