// src/features/dashboard/pages/DashboardPage.jsx

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-[#070B15] px-[16px] py-[32px] text-center font-sans">
      <div className="w-full max-w-xl rounded-[20px] border border-[#24324D] bg-[#121827] px-[20px] py-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.30)] sm:rounded-[24px] sm:p-10">
        <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#00D4E9] sm:text-[13px]">
          Smart Clinic
        </p>

        <h1 className="mt-4 text-[30px] font-black leading-tight tracking-[-0.04em] text-[#EEF4FC] sm:text-[42px]">
          Home Screen
        </h1>

        <p className="mt-4 text-[14px] font-medium leading-6 text-[#8B96AA] sm:text-[15px] sm:leading-7">
          Login successful. Real dashboard screen hum next step mein Figma ke
          according build karenge.
        </p>
      </div>
    </main>
  );
}
