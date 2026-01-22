import Navbar from "@/components/Navbar"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navbar />
      {children}
    </div>
  )
}