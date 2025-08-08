import Link from 'next/link';

export default function Header() {
  return (
    <header className="w-full flex justify-between items-center py-4 px-6">
      <div className="flex-1">
        <Link href="/" className="text-white hover:text-white/80 transition-colors">
          <h1 className="text-xl sm:text-2xl font-bold">Spin to Focus</h1>
        </Link>
      </div>
      
      <div className="flex-1">
        {/* Middle area empty for layout balance */}
      </div>
      
      <div className="flex-1 flex justify-end">
        <button className="btn btn-secondary">
          Login
        </button>
      </div>
    </header>
  );
}
