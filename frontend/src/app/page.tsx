"use client";

import Calculator from "../components/Calculator";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-8">在线计算器</h1>
        <p className="text-center mb-8 text-gray-600">
        后端：Go+ConnectRPC 前端：Next.js
        </p>
        <Calculator />
      </div>
    </main>
  );
}
