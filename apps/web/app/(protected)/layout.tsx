import ConditionalHeader from '~/components/protected/ConditionalHeader'


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (

    <>
      <ConditionalHeader />
      {children}
    </>
  )
}

