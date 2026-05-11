/**
 * Image picker for admin forms.
 *
 *  - "Upload" opens the native file picker (accept=image/*)
 *  - "Take photo" opens an in-page camera modal using getUserMedia, captures
 *    the current video frame to a canvas, and returns the JPEG as a File
 *  - Drag-and-drop on the preview area is also supported
 *
 * The component is controlled-ish:
 *  - `existingUrl`  is the current image URL stored on the server (for preview
 *    before any change). Pass null if there is none.
 *  - `onChange(file)` fires whenever the user selects a new file (either via
 *    upload or capture). The parent submits this File with the form payload.
 *
 * Cleared images aren't supported in this v1 (user can replace, not delete).
 */
import { Camera, ImagePlus, RefreshCw, Upload, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";

type Props = {
  existingUrl?: string | null;
  onChange: (file: File | null) => void;
  label?: string;
};

export function ImagePicker({ existingUrl, onChange, label = "Image" }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // Generate (and clean up) an object URL for the picked file so we can show
  // a live preview without uploading first.
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  const previewSrc = objectUrl ?? existingUrl ?? null;

  const handleFile = useCallback(
    (f: File | null) => {
      setFile(f);
      onChange(f);
    },
    [onChange],
  );

  const onUploadClick = () => fileInputRef.current?.click();
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) handleFile(f);
    // Reset so re-selecting the same file fires onChange again.
    e.target.value = "";
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-stone-800">{label}</label>

      <div className="mt-1 flex gap-4">
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition ${
            dragOver
              ? "border-emerald-500 bg-emerald-50"
              : "border-stone-200 bg-stone-50"
          }`}
        >
          {previewSrc ? (
            <img
              src={previewSrc}
              alt="Product preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center text-stone-400">
              <ImagePlus className="h-6 w-6" aria-hidden />
              <span className="mt-1 text-[10px] uppercase tracking-wider">
                Drop here
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onUploadClick}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            <Upload className="h-4 w-4" aria-hidden />
            {file || existingUrl ? "Replace image" : "Upload image"}
          </button>
          <button
            type="button"
            onClick={() => setCameraOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-4 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            <Camera className="h-4 w-4" aria-hidden />
            Take photo
          </button>
          {file && (
            <p className="text-xs text-stone-500">
              <span className="font-medium text-stone-700">{file.name}</span>{" "}
              · {formatBytes(file.size)} (will upload on save)
            </p>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        // `capture` is honoured on mobile to open the rear camera straight
        // away; desktop browsers ignore it and use the file picker.
        capture="environment"
        onChange={onFileInputChange}
        className="hidden"
      />

      {cameraOpen && (
        <CameraModal
          onCapture={(f) => {
            handleFile(f);
            setCameraOpen(false);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Camera capture modal
// ──────────────────────────────────────────────────────────────────────────

function CameraModal({
  onCapture,
  onClose,
}: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Open the camera once on mount, and again whenever the user toggles facing.
  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError(null);

    async function start() {
      // Stop any previous tracks before re-requesting.
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;

      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "Your browser doesn't support camera access. Use the Upload button instead.",
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => undefined);
            setReady(true);
          };
        }
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Couldn't access the camera.";
        setError(
          /permission/i.test(msg)
            ? "Camera permission was denied. Allow access in your browser settings, or use Upload instead."
            : msg,
        );
      }
    }

    void start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing]);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
      },
      "image/jpeg",
      0.92,
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Take a photo"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-stone-900 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold">Take a photo</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-stone-300 hover:bg-white/10 hover:text-white"
            aria-label="Close camera"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="relative aspect-video bg-black">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-sm text-stone-200">
              <p className="font-medium text-rose-300">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-stone-100"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                className="absolute inset-0 h-full w-full object-cover"
              />
              {!ready && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-400">
                  Starting camera…
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 py-3">
          <button
            type="button"
            onClick={() =>
              setFacing((f) => (f === "environment" ? "user" : "environment"))
            }
            disabled={!!error}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/20 px-3 text-sm text-stone-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Switch
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-white/20 px-4 text-sm text-stone-200 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={capture}
              disabled={!ready || !!error}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white shadow hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera className="h-4 w-4" aria-hidden />
              Capture
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
