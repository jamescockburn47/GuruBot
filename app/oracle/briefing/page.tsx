import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { BriefingClient } from '@/components/oracle/BriefingClient'

export default async function BriefingPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  return <BriefingClient userId={userId} />
}
