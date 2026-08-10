"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COURSE } from "@/lib/constants";

export default function StudentScanPage() {
  const router = useRouter();
  const [scanError, setScanError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<boolean>(false);

  useEffect(() => {
    let scannerInstance: any = null;

    import("html5-qrcode")
      .then(({ Html5QrcodeScanner }) => {
        scannerInstance = new Html5QrcodeScanner(
          "reader",
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
          },
          false
        );

        scannerInstance.render(
          (decodedText: string) => {
            if (scannerInstance) {
              scannerInstance
                .clear()
                .then(() => {
                  if (decodedText.startsWith(window.location.origin) || decodedText.includes("/attendance/")) {
                    router.push(decodedText);
                  } else {
                    setScanError("Invalid attendance QR code link format.");
                    setTimeout(() => window.location.reload(), 3000);
                  }
                })
                .catch((err: any) => {
                  console.error("Error clearing scanner:", err);
                  router.push(decodedText);
                });
            }
          },
          () => {
            // Suppress noisy frame scan mismatch logs
          }
        );
      })
      .catch((err) => {
        console.error("Failed to load html5-qrcode package:", err);
        setPermissionError(true);
      });

    return () => {
      if (scannerInstance) {
        scannerInstance
          .clear()
          .catch((err: any) => console.error("Error during scanner cleanup:", err));
      }
    };
  }, [router]);

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950 text-slate-100">
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/60 border border-slate-800/50 backdrop-blur-xl shadow-2xl space-y-6 text-center animate-fade-in">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{COURSE.code}</span>
          <h1 className="text-2xl font-bold mt-1 text-slate-100">Attendance QR Scanner</h1>
          <p className="text-sm text-slate-400">Position the QR code inside the box to scan.</p>
        </div>

        {/* Camera video reader display box */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950 max-w-[320px] w-full mx-auto aspect-square">
          <div id="reader" className="w-full [&_video]:rounded-xl [&_video]:object-cover" />
          
          {scanError && (
            <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center p-4">
              <p className="text-sm text-rose-400 font-bold">{scanError}</p>
            </div>
          )}

          {permissionError && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-4 space-y-2">
              <p className="text-sm text-rose-400 font-bold">Camera Access Error</p>
              <p className="text-xs text-slate-400 text-center">
                Camera permission is required to scan the QR code. Please enable permissions and reload the page.
              </p>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-500 font-medium">
          Mobile-friendly scanning with automatic token validation.
        </p>

        <div className="flex gap-4 pt-2">
          <Link
            href="/student/dashboard"
            className="flex-1 py-2.5 px-4 text-center rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 font-semibold text-slate-300 text-sm transition-colors cursor-pointer"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
