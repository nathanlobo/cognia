import GlobalLoader from '@/components/GlobalLoader'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <GlobalLoader>{children}</GlobalLoader>
}
