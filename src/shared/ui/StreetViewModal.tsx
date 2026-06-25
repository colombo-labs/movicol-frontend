import { X } from "lucide-react";

const GMAPS_KEY = "AIzaSyBApoqOimZb0onMDqhWTaQGqBGO02VUJsQ";

interface Props {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly lat: number;
  readonly lng: number;
  readonly title?: string;
}

export function StreetViewModal({ isOpen, onClose, lat, lng, title }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-[92vw] h-[75vh] max-w-5xl rounded-2xl overflow-hidden border border-divider shadow-2xl">
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
        <iframe
          src={`https://www.google.com/maps/embed/v1/streetview?location=${lat},${lng}&key=${GMAPS_KEY}&fov=90&heading=0&pitch=0`}
          className="w-full h-full border-0"
          title="Street View"
          allowFullScreen
        />
      </div>
    </div>
  );
}

export function openStreetView(lat: number, lng: number) {
  // Fallback: kept for compatibility
  window.open(
    `https://www.google.com/maps/@${lat},${lng},3a,75y,0h,90t/data=!3m4!1e1!3m2!1s!2e0`,
    "_blank",
  );
}
