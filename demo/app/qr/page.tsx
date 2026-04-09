import { QRCodeSVG } from 'qrcode.react';

export default function QRPage() {
  const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL || 'https://asktwin.azurestaticapps.net';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Ask Your Twin
      </h1>
      <p className="text-lg text-gray-500 mb-8">
        Interactive Agentic Digital Twin Demo
      </p>

      {/* QR Code */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <QRCodeSVG
          value={demoUrl}
          size={300}
          bgColor="#FFFFFF"
          fgColor="#1E293B"
          level="M"
          includeMargin={false}
        />
      </div>

      {/* URL text */}
      <p className="mt-6 text-sm text-gray-400 font-mono">
        {demoUrl}
      </p>

      {/* Instructions */}
      <p className="mt-4 text-base text-gray-600">
        Scan to try the demo on your phone 📱
      </p>
    </div>
  );
}
