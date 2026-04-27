import VideoCompare from "../components/detection/VideoCompare";
import ParameterCard from "../components/detection/ParameterCard";

export default function DetectionPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      
      <h1 className="text-3xl font-bold mb-6">Live Detection</h1>

      <VideoCompare />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <ParameterCard title="Similarity" value={92} />
        <ParameterCard title="Logo Match" value={88} />
        <ParameterCard title="Audio Match" value={95} />
        <ParameterCard title="Crop Level" value={70} />
      </div>

    </div>
  );
}