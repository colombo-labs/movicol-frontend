import { X } from "lucide-react";

const GOOGLE_KEY = "AIzaSyBk3OGVm2FaPsVH0SGIYR3txGz1SEkl4zE";

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
      <div className="relative w-[90vw] h-[70vh] max-w-4xl rounded-2xl overflow-hidden border border-divider shadow-2xl">
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
          src={`https://www.google.com/maps/embed/v1/streetview?location=${lat},${lng}&key=${GOOGLE_KEY}&fov=90`}
          className="w-full h-full border-0"
          title="Street View"
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
