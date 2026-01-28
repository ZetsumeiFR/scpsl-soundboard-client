interface AdminFilterTabsProps {
  value: "all" | "admins" | "banned";
  onChange: (value: "all" | "admins" | "banned") => void;
}

export function AdminFilterTabs({ value, onChange }: AdminFilterTabsProps) {
  const tabs = [
    { key: "all" as const, label: "Tous" },
    { key: "admins" as const, label: "Admins" },
    { key: "banned" as const, label: "Bannis" },
  ];

  return (
    <div className="flex gap-1 bg-bg-dark rounded-lg p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            value === tab.key
              ? "bg-primary text-text-primary"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
