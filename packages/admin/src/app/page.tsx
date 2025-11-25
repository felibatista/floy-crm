import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">Floy CRM Admin</h1>
        <Link
          href="/clients"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Manage Clients
        </Link>
      </div>
    </main>
  );
}
