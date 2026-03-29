import Navbar from "../home/_components/navbar"

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}