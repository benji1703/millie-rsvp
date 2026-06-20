import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import type { Guest } from '@/types'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const { data: guests } = await supabaseAdmin
    .from('guests')
    .select('*')
    .order('created_at', { ascending: true })

  return <AdminClient initialGuests={(guests ?? []) as Guest[]} />
}
