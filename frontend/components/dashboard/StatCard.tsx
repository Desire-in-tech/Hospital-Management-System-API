interface StatCardProps {
  label: string;
  value: number | string;
  description?: string;
}

export default function StatCard({
  label,
  value,
  description,
}: StatCardProps) {
  return (
    <div className="border border-[#dfe5df] bg-[#eef6f1] p-5">
      <p className="text-sm font-medium text-[#66736c]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#194536]">
        {value}
      </p>
      {description && (
        <p className="mt-2 text-xs text-[#66736c]">{description}</p>
      )}
    </div>
  );
}
