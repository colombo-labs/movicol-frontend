import { useTranslation } from "react-i18next";
import { useRequireAuth } from "@shared/hooks/useRequireAuth";
import { useSavedRoutes } from "@shared/hooks/useSavedRoutes";
import { useState, useEffect, useRef } from "react";
import {
  Navigation,
  Bell,
  Share2,
  MapPinned,
  MapPin,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Coffee,
  Landmark,
  Pill,
  UtensilsCrossed,
  Bike,
  Store,
} from "lucide-react";
import { GlassCard } from "@shared/ui/GlassCard";
import type { RoutePrediction } from "@modules/predicciones/models";
import type { TripPoint } from "@/app/Layout";

export function ActionButtons({
  prediction,
  tripPoints,
  onClear,
}: {
  readonly prediction: RoutePrediction;
  readonly tripPoints: TripPoint[];
  readonly onClear: () => void;
}) {
  const { t } = useTranslation();
  const { requireAuth } = useRequireAuth();
  const { save: saveRoute } = useSavedRoutes();
  return (
    <>
      <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.95] shadow-lg shadow-primary/30">
        <Navigation size={14} className="animate-pulse" /> {t("route.startNav")}
      </button>
      <div className="flex gap-2">
        <button
          onClick={() => {
            if (navigator.share)
              navigator
                .share({
                  title: "Mi ruta MoviCol",
                  text: `Ruta de ${Math.round(prediction.total_time_minutes)} min`,
                  url: globalThis.location.href,
                })
                .catch(() => {});
          }}
          className="flex-1 py-2 rounded-lg border border-divider text-[10px] font-medium text-default-500 hover:bg-default-100 transition-all flex items-center justify-center gap-1"
        >
          {t("route.share")}
        </button>
        <button
          onClick={() => requireAuth(async () => {
            const origin = tripPoints[0];
            const dest = tripPoints.slice(-1)[0];
            if (!origin || !dest) return;
            await saveRoute({
              originLabel: origin.label || `${origin.lat.toFixed(4)}, ${origin.lng.toFixed(4)}`,
              originLat: origin.lat,
              originLng: origin.lng,
              destLabel: dest.label || `${dest.lat.toFixed(4)}, ${dest.lng.toFixed(4)}`,
              destLat: dest.lat,
              destLng: dest.lng,
              estimatedMinutes: Math.round(prediction.total_time_minutes),
              mode: "publico",
            });
            const btn = document.activeElement as HTMLButtonElement;
            if (btn) {
              btn.textContent = "✓";
              setTimeout(() => { btn.textContent = t("planner.save"); }, 1500);
            }
          })}

































          className="flex-1 py-2 rounded-lg border border-divider text-[10px] font-medium text-default-500 hover:bg-default-100 transition-all flex items-center justify-center gap-1"
        >
          {t("route.save")}
        </button>
        <button
          onClick={onClear}
          className="flex-1 py-2 rounded-lg border border-danger/30 text-[10px] font-medium text-danger hover:bg-danger/10 transition-all flex items-center justify-center gap-1"
        >
          {t("route.new")}
        </button>
      </div>
    </>
  );
}

export function QuickActions({ onFocusMap }: { readonly onFocusMap: () => void }) {
  const { t } = useTranslation();
  const [alarmSet, setAlarmSet] = useState(false);
  const [reported, setReported] = useState(false);

  const handleAlarm = () => {
    setAlarmSet(!alarmSet);
    if (!alarmSet && "Notification" in window) {
      Notification.requestPermission();
    }
  };

  const handleShareLive = () => {
    const url = `${window.location.origin}/planificar?shared=true`;
    if (navigator.share) {
      navigator.share({ title: "Mi viaje en MoviCol", url });
    } else {
      navigator.clipboard.writeText(url);
    }
  };

  const handleReport = () => {
    setReported(true);
    setTimeout(() => setReported(false), 3000);
  };

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <button onClick={handleAlarm} className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-divider/50 text-[10px] transition-all ${alarmSet ? "bg-primary/20 text-primary border-primary/30" : "bg-default-100 text-foreground hover:bg-default-200"}`}>
        <Bell size={12} className={alarmSet ? "text-primary" : "text-default-500"} /> {alarmSet ? "✓ Activa" : t("route.alarmStop")}
      </button>
      <button onClick={handleShareLive} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 border border-divider/50 text-[10px] text-foreground hover:bg-default-200 transition-all">
        <Share2 size={12} className="text-default-500" /> {t("route.shareLive")}
      </button>
      <button onClick={handleReport} className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-divider/50 text-[10px] transition-all ${reported ? "bg-success/20 text-success border-success/30" : "bg-default-100 text-foreground hover:bg-default-200"}`}>
        <AlertCircle size={12} className={reported ? "text-success" : "text-warning"} /> {reported ? "✓ Reportado" : t("route.reportIncident")}
      </button>
      <button onClick={onFocusMap} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-default-100 border border-divider/50 text-[10px] text-foreground hover:bg-default-200 transition-all">
        <MapPinned size={12} className="text-default-500" /> {t("route.viewFullMap")}
      </button>
    </div>
  );
}

interface OverpassElement {
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

function mapOverpassElement(
  el: OverpassElement,
  destLat: number,
  destLng: number,
) {
  const d = Math.round(Math.hypot(el.lat - destLat, el.lon - destLng) * 111000);
  const tags = el.tags || {};
  const type = tags.amenity || tags.shop || "lugar";
  const typeLabel: Record<string, string> = {
    cafe: "cafe",
    atm: "atm",
    bank: "bank",
    pharmacy: "pharmacy",
    restaurant: "restaurant",
    bicycle_rental: "bike",
    supermarket: "supermarket",
    convenience: "store",
  };
  return {
    name: tags.name || type,
    dist: `${d}m`,
    type: typeLabel[type] || "pin",
  };
}

function PoiIcon({ type }: { readonly type: string }) {
  const cls = "text-primary";
  const s = 13;
  if (type === "cafe") return <Coffee size={s} className={cls} />;
  if (type === "atm" || type === "bank")
    return <Landmark size={s} className={cls} />;
  if (type === "pharmacy") return <Pill size={s} className={cls} />;
  if (type === "restaurant")
    return <UtensilsCrossed size={s} className={cls} />;
  if (type === "bike") return <Bike size={s} className={cls} />;
  if (type === "supermarket" || type === "store")
    return <Store size={s} className={cls} />;
  return <MapPin size={s} className={cls} />;
}

async function fetchNearbyPois(destLat: number, destLng: number) {
  const radius = 200;
  const query = `[out:json][timeout:5];(
    node["amenity"="cafe"](around:${radius},${destLat},${destLng});
    node["amenity"="atm"](around:${radius},${destLat},${destLng});
    node["shop"](around:${radius},${destLat},${destLng});
    node["amenity"="pharmacy"](around:${radius},${destLat},${destLng});
    node["amenity"="restaurant"](around:${radius},${destLat},${destLng});
  );out body 6;`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const r = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!r.ok) return [];
    const data = await r.json();
    return (data.elements || [])
      .map((el: OverpassElement) => mapOverpassElement(el, destLat, destLng))
      .slice(0, 6);
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

export function NearDestination({
  destLat,
  destLng,
}: {
  readonly destLat?: number;
  readonly destLng?: number;
}) {
  const { t } = useTranslation();
  const [places, setPlaces] = useState<
    { name: string; dist: string; type: string }[]
  >([]);
  const cacheRef = useRef<
    Map<string, { name: string; dist: string; type: string }[]>
  >(new Map());

  useEffect(() => {
    if (!destLat || !destLng) return;
    const key = `${destLat.toFixed(3)},${destLng.toFixed(3)}`;
    const cached = cacheRef.current.get(key);
    if (cached) {
      setPlaces(cached);
      return;
    }

    const timer = setTimeout(() => {
      fetchNearbyPois(destLat, destLng)
        .then((results) => {
          setPlaces(results);
          cacheRef.current.set(key, results);
        })
        .catch(() => {});
    }, 1000);
    return () => clearTimeout(timer);
  }, [destLat, destLng]);

  if (places.length === 0) return null;

  return (
    <GlassCard>
      <span className="text-[10px] font-semibold mb-1.5 block">
        {t("route.nearDestination")}
      </span>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {places.map((p) => (
          <div
            key={`poi-${p.name}-${p.dist}`}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg bg-default-100 min-w-[56px]"
          >
            <PoiIcon type={p.type} />
            <span className="text-[8px] text-foreground font-medium text-center leading-tight truncate max-w-[52px]">
              {p.name}
            </span>
            <span className="text-[8px] text-default-400">{p.dist}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function TravelTips({ mode }: { readonly mode: string }) {
  const { t } = useTranslation();
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const hour = new Date().getHours();
  let tip: string;
  if (hour < 10)
    tip = t("route.tipMorning");
  else if (hour < 16)
    tip = t("route.tipMidday");
  else
    tip = t("route.tipEvening");

  return (
    <>
      <div className="px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
        <p className="text-[9px] text-blue-600">
          <strong>{t("route.tip")}</strong> {tip}
        </p>
      </div>
      {(hour >= 19 || hour < 5) && (
        <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
          <p className="text-[9px] text-purple-600">
            <strong>Viaje nocturno:</strong> Mantente en zonas iluminadas. El
            último servicio sale a las 11:00 PM.
          </p>
        </div>
      )}
      <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-default-100/50">
        <p className="text-[9px] text-default-400">{t("route.wasUseful")}</p>
        <div className="flex gap-2">
          <button
            className="p-1.5 rounded-full hover:bg-success/20 transition-colors"
            onClick={() => setVote(vote === "up" ? null : "up")}
          >
            <ThumbsUp
              size={14}
              className={vote === "up" ? "text-success" : "text-default-400"}
              fill={vote === "up" ? "currentColor" : "none"}
            />
          </button>
          <button
            className="p-1.5 rounded-full hover:bg-danger/20 transition-colors"
            onClick={() => setVote(vote === "down" ? null : "down")}
          >
            <ThumbsDown
              size={14}
              className={vote === "down" ? "text-danger" : "text-default-400"}
              fill={vote === "down" ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>
      {mode !== "vehiculo" && <TuLlaveCard />}
    </>
  );
}

function TuLlaveCard() {
  const { t } = useTranslation();
  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-6 rounded overflow-hidden flex items-center justify-center">
            <img src="/icons/tullave.svg" alt="TuLlave" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[10px] font-semibold">{t("route.tullave")}</p>
            <p className="text-[9px] text-default-400">
              {t("route.estimatedBalance")}
            </p>
          </div>
        </div>
        <p className="text-sm font-bold text-success">$12,050</p>
      </div>
    </GlassCard>
  );
}
