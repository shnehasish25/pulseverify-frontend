export default function VideoCompare() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <h2 className="mb-2 text-lg">Original Video</h2>
        <video controls className="w-full rounded-lg">
          <source src="https://www.w3schools.com/html/mov_bbb.mp4" />
        </video>
      </div>

      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <h2 className="mb-2 text-lg">Pirated Video</h2>
        <video controls className="w-full rounded-lg">
          <source src="https://www.w3schools.com/html/movie.mp4" />
        </video>
      </div>

    </div>
  );
}