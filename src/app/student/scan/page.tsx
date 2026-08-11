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
            videoConstraints: {
              facingMode: "environment", // Enforce back/rear camera on mobile
            },
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
    <div className="flex-1 flex flex-col justify-between bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 transition-colors">
      {/* Top Bar Banner */}
      <div className="bg-[#004ad7] text-white text-xs font-semibold text-center py-2 px-4 shadow-sm">
        📷 QR Scanner • Materials Joining Technology (MJT)
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6 text-center animate-fade-in transition-colors">
          <div>
            <span className="inline-flex px-2 py-0.5 text-xxs font-bold text-primary bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded uppercase tracking-wider">
              {COURSE.code} Check-in
            </span>
            <h1 className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">Scan QR Code</h1>
            <p className="text-sm text-slate-505 dark:text-slate-400 font-medium">Align the classroom QR code inside the box to scan.</p>
          </div>

          {/* Centered responsive camera reader display box */}
          <div className="w-full max-w-[320px] mx-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 overflow-hidden shadow-inner [&_video]:rounded-xl [&_video]:object-cover [&_video]:w-full [&_video]:h-full [&_button]:bg-primary [&_button]:hover:bg-primary-hover [&_button]:text-white [&_button]:px-4 [&_button]:py-2.5 [&_button]:rounded-lg [&_button]:font-bold [&_button]:text-xs [&_button]:cursor-pointer [&_button]:shadow-sm [&_select]:bg-white [&_select]:dark:bg-slate-800 [&_select]:border [&_select]:border-slate-300 [&_select]:dark:border-slate-700 [&_select]:rounded-lg [&_select]:px-3 [&_select]:py-2 [&_select]:text-xs [&_select]:cursor-pointer [&_#reader]:border-none [&_#reader__scan_region]:flex [&_#reader__scan_region]:justify-center [&_#reader__scan_region]:items-center relative aspect-square flex items-center justify-center">
            <div id="reader" className="w-full" />
            
            {scanError && (
              <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 flex items-center justify-center p-4">
                <p className="text-sm text-rose-600 font-bold">{scanError}</p>
              </div>
            )}

            {permissionError && (
              <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 flex flex-col items-center justify-center p-4 space-y-2">
                <p className="text-sm text-rose-600 font-bold">Camera Access Error</p>
                <p className="text-xs text-slate-505 dark:text-slate-400 text-center font-medium">
                  Camera permission is required to scan the QR code. Please enable permissions and reload the page.
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Scanning will automatically redirect you to the attendance validation screen.
          </p>

          <div className="flex gap-4 pt-2 border-t border-slate-100 dark:border-slate-700">
            <Link
              href="/student/dashboard"
              className="flex-1 py-3 px-4 text-center rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 font-bold text-slate-700 dark:text-slate-200 text-sm transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs font-medium text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors">
        © 2026 Attendance Tracker • Secured with Google OAuth & Real-time DB Validation.
      </footer>
    </div>
  );
}
