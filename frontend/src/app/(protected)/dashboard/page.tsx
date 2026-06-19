import { Building2, GitBranch, Network, Users } from "lucide-react";

export default function DashboardPage() {
  const cards = [
    { title: "Companies", value: "0", icon: Building2 },
    { title: "Branches", value: "0", icon: GitBranch },
    { title: "Departments", value: "0", icon: Network },
    { title: "Employees", value: "0", icon: Users },
  ];

  return (
    <>
      <section className="ams-gradient rounded-3xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold">Audit Management System</h1>
        <p className="mt-2 max-w-2xl text-blue-100">
          Enterprise-grade platform for audit universe, planning, execution,
          reporting and CAPA management.
        </p>
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="ams-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    {item.title}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    {item.value}
                  </h2>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon size={28} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="ams-card p-6 xl:col-span-2">
          <h3 className="text-lg font-bold text-slate-900">
            Audit Workflow Overview
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Audit Universe → Audit Plan → Assignment → Working Paper →
            Observation → Report → CAPA
          </p>

          <div className="mt-6 h-72 rounded-2xl border border-dashed border-slate-300 bg-slate-50" />
        </div>

        <div className="ams-card p-6">
          <h3 className="text-lg font-bold text-slate-900">Quick Actions</h3>

          <div className="mt-5 space-y-3">
            <button className="ams-btn-primary w-full">Create Company</button>
            <button className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">
              Add Employee
            </button>
            <button className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50">
              Start Audit Universe
            </button>
          </div>
        </div>
      </section>
    </>
  );
}