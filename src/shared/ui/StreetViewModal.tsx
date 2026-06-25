import { X, ExternalLink } from "lucide-react";

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly lat: number;
  readonly lng: number;
  readonly title?: string;
}

export function StreetViewModal({ isOpen, onClose, lat, lng, title }: Props) {
  if (!isOpen) return null;

  const streetViewUrl = `https://www.google.com/maps/@${lat},${lng},3a,75y,90t/data=!3m6!1e1!3m4!1s!2e0!7i16384!8i8192`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-[90vw] h-[70vh] max-w-4xl rounded-2xl overflow-hidden border border-divider shadow-2xl bg-background">
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-background/80 backdrop-blur-md border-b border-divider">
          <span className="text-sm font-semibold text-foreground">
            {title || "Vista de calle"}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-default-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <img
            src={`https://maps.googleapis.com/maps/api/streetview?size=800x400&location=${lat},${lng}&fov=90&key=AIzaSyBk3OGVm2FaPsVH0SGIYR3txGz1SEkl4zE`}
            alt="Street View"
            className="w-full max-w-2xl rounded-lg shadow-lg"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=17&size=800x400&maptype=satellite&key=AIzaSyBk3OGVm2FaPsVH0SGIYR3txGz1SEkl4zE`; }}
          />
          <a
            href={streetViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all"
          >
            <ExternalLink size={14} /> Abrir en Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
