export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-clinic-page px-6 text-center">
      <div className="max-w-xl rounded-clinic-lg border border-clinic-border bg-clinic-panel p-10 shadow-loginCard">
        <p className="text-[13px] font-black uppercase tracking-[0.2em] text-clinic-primary">
          Smart Clinic
        </p>

        <h1 className="mt-4 text-[42px] font-black tracking-[-0.06em] text-clinic-heading">
          Home Screen
        </h1>

        <p className="mt-4 text-[15px] font-medium leading-7 text-clinic-muted">
          Login successful. Real dashboard screen hum next step mein Figma ke
          according build karenge.
        </p>
      </div>
    </main>
  );
}