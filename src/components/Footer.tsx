export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full text-center py-6 text-white/60 text-sm">
      <p>©{currentYear} Spin to Focus.</p>
      <p>All rights reserved.</p>
    </footer>
  );
}
