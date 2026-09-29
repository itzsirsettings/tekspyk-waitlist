import Link from "next/link";
export default function NotFound() {
  return <main className="learning-main"><h1>Page not found</h1><p>This page may have moved, or you may not have access to this class.</p><Link className="learning-primary" href="/learn">Go to your learning workspace</Link><p><Link href="/">TekSpyk home</Link></p></main>;
}
