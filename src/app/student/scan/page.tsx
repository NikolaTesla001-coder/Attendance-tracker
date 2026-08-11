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
    <div className="flex-1 flex flex-col justify-between bg-slate-50 min-h-screen">
      {/* Top Bar Banner */}
      <div className="bg-[#004ad7] text-white text-xs font-semibold text-center py-2 px-4 shadow-sm">
        📷 QR Scanner • Materials Joining Technology (MJT)
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-6 text-center animate-fade-in">
          <div>
            <span className="inline-flex px-2 py-0.5 text-xxs font-bold text-primary bg-blue-50 border border-blue-100 rounded uppercase tracking-wider">
              {COURSE.code} Check-in
            </span>
            <h1 className="text-2xl font-bold mt-2 text-slate-900">Scan QR Code</h1>
            <p className="text-sm text-slate-500 font-medium">Align the classroom QR code inside the box to scan.</p>
          </div>

          {/* Camera video reader display box */}
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50 max-w-[300px] w-full mx-auto aspect-square shadow-inner">
            <div id="reader" className="w-full [&_video]:rounded-xl [&_video]:object-cover [&_a]:text-primary [&_button]:bg-primary [&_button]:text-white [&_button]:px-4 [&_button]:py-2 [&_button]:rounded-lg [&_button]:font-bold" />
            
            {scanError && (
              <div className="absolute inset-0 bg-white/95 flex items-center justify-center p-4">
                <p className="text-sm text-rose-600 font-bold">{scanError}</p>
              </div>
            )}

            {permissionError && (
              <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-4 space-y-2">
                <p className="text-sm text-rose-600 font-bold">Camera Access Error</p>
                <p className="text-xs text-slate-500 text-center font-medium">
                  Camera permission is required to scan the QR code. Please enable permissions and reload the page.
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Scanning will automatically redirect you to the attendance validation screen.
          </p>

          <div className="flex gap-4 pt-2 border-t border-slate-100">
            <Link
              href="/student/dashboard"
              className="flex-1 py-3 px-4 text-center rounded-xl bg-white hover:bg-slate-50 border border-slate-200 font-bold text-slate-700 text-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs font-medium text-slate-400 border-t border-slate-200 bg-white">
        © 2026 OneTap Checkin • Secured with Google OAuth & Real-time DB Validation.
      </footer>
    </div>
  );
}
