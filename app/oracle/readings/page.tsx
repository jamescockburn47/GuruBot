import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { VisionGallery } from '@/components/oracle/VisionGallery'

export default async function ReadingsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  
  return <VisionGallery userId={userId} />
}
