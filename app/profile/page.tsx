import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import ProfileEditor from './ProfileEditor'

export default async function ProfilePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  return <ProfileEditor userId={userId} />
}
