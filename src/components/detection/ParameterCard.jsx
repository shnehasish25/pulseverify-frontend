export default function ParameterCard({ title, value }) {
  return (
    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-center">
      
      <h3 className="text-sm text-zinc-400 mb-2">{title}</h3>

      <div className="text-2xl font-bold text-green-400">
        {value}%
      </div>

    </div>
  );
}