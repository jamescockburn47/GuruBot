import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { ChatInterface } from '@/components/oracle/ChatInterface'

export default async function OraclePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  return <ChatInterface userId={userId} />
}
