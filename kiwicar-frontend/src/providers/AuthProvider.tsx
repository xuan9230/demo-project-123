import { useEffect, type ReactNode } from 'react'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types'

type ProfileRow = {
  id: string
  email: string
  phone: string | null
  nickname: string
  avatar: string | null
  region: string
  created_at: string
  show_phone_on_listings: boolean
}

type ProfileInsert = Omit<ProfileRow, 'created_at'> & { created_at?: string }

const mapProfileToUser = (profile: ProfileRow): User => ({
  id: profile.id,
  email: profile.email,
  phone: profile.phone ?? undefined,
  nickname: profile.nickname,
  avatar: profile.avatar ?? undefined,
  region: profile.region,
  createdAt: profile.created_at,
  showPhoneOnListings: profile.show_phone_on_listings,
})

const buildProfileInsert = (authUser: SupabaseUser): ProfileInsert => {
  const fallbackNickname = authUser.email?.split('@')[0] || 'KiwiCar User'
  const metadata = authUser.user_metadata || {}
  return {
    id: authUser.id,
    email: authUser.email || '',
    phone: authUser.phone || null,
    nickname: metadata.nickname || fallbackNickname,
    avatar: metadata.avatar || null,
    region: metadata.region || 'Auckland',
    show_phone_on_listings: false,
  }
}

async function ensureProfile(session: Session): Promise<User | null> {
  const authUser = session.user
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle()

  if (error) {
    console.error('Failed to load profile', error)
    return null
  }

  if (data) {
    return mapProfileToUser(data as ProfileRow)
  }

  const insertPayload = buildProfileInsert(authUser)
  const { data: created, error: insertError } = await supabase
    .from('profiles')
    .insert(insertPayload)
    .select('*')
    .single()

  if (insertError) {
    console.error('Failed to create profile', insertError)
    return null
  }

  return mapProfileToUser(created as ProfileRow)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setSession, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    let isActive = true

    const hydrate = async (session: Session | null) => {
      setSession(session)
      if (!session?.user) {
        setUser(null)
        return
      }

      const profile = await ensureProfile(session)
      if (!isActive) return
      setUser(profile)
    }

    const init = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Failed to read auth session', error)
      }

      if (!isActive) return
      await hydrate(data.session)
      if (isActive) setLoading(false)
    }

    void init()

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isActive) return
      if (event === 'SIGNED_OUT') {
        setSession(null)
        setUser(null)
        return
      }
      void hydrate(session)
    })

    return () => {
      isActive = false
      data.subscription.unsubscribe()
    }
  }, [setLoading, setSession, setUser])

  return <>{children}</>
}
