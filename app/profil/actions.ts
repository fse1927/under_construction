'use server'

import { createClient } from '@/lib/supabase/server'
import { UserProfile, UserStats } from '@/lib/types'
import { revalidatePath } from 'next/cache'

// ... (imports remain)

export async function getUserProfile(): Promise<{ user: UserProfile; stats: UserStats } | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    let { data: profile } = await supabase
        .from('utilisateurs')
        .select('*')
        .eq('id', user.id)
        .single()

    // Lazy Sync: If profile missing but user exists (Trigger failure recovery)
    if (!profile) {
        console.warn('Profile missing for user, attempting lazy sync...', user.id);
        const { data: newProfile, error } = await supabase
            .from('utilisateurs')
            .insert({
                id: user.id,
                surnom: user.user_metadata?.surnom || user.user_metadata?.full_name || 'Utilisateur',
                profil_situation: user.user_metadata?.situation || 'Non défini',
                email: user.email
            })
            .select()
            .single();

        if (!error && newProfile) {
            profile = newProfile;
        } else {
            console.error('Failed to lazy sync profile:', error);
            // Return basic mock to avoid blocking login loop
            profile = {
                id: user.id,
                surnom: user.user_metadata?.surnom || 'Utilisateur',
                profil_situation: user.user_metadata?.situation || 'Non défini',
                email: user.email,
                is_admin: false
            } as any;
        }
    }

    // Also fetch stats - Last 10 tests for chart
    const { data: history } = await supabase
        .from('historique_tests')
        .select('score_pourcentage, date_test')
        .eq('user_id', user.id)
        .order('date_test', { ascending: false })
        .limit(10)

    // Calculate average 
    const { data: allScores } = await supabase
        .from('historique_tests')
        .select('score_pourcentage')
        .eq('user_id', user.id)

    const realTotal = allScores?.length || 0
    const realAvg = realTotal > 0
        ? Math.round(allScores!.reduce((acc, curr) => acc + curr.score_pourcentage, 0) / realTotal)
        : 0

    // Reverse history for chart (Oldest -> Newest)
    const chartData = history ? [...history].reverse() : []

    return {
        user: {
            ...profile,
            nickname: profile.surnom, // Map DB column 'surnom' to Type 'nickname'
            email: user.email
        } as UserProfile,
        stats: {
            totalTests: realTotal,
            avgScore: realAvg,
            history: chartData
        }
    }
}

export async function updateUserProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Not authenticated')

    const nickname = formData.get('nickname') as string
    const profil_situation = formData.get('profil_situation') as string

    // Extended profile fields
    const sexe = formData.get('sexe') as string || null
    const date_naissance = formData.get('date_naissance') as string || null
    const pays_naissance = formData.get('pays_naissance') as string || null
    const ville_residence = formData.get('ville_residence') as string || null
    const profession = formData.get('profession') as string || null
    const nationalite_origine = formData.get('nationalite_origine') as string || null
    const date_arrivee_france = formData.get('date_arrivee_france') as string || null
    const niveau_francais = formData.get('niveau_francais') as string || null

    const { error } = await supabase
        .from('utilisateurs')
        .update({
            surnom: nickname,
            profil_situation,
            sexe: sexe || null,
            date_naissance: date_naissance || null,
            pays_naissance: pays_naissance || null,
            ville_residence: ville_residence || null,
            profession: profession || null,
            nationalite_origine: nationalite_origine || null,
            date_arrivee_france: date_arrivee_france || null,
            niveau_francais: niveau_francais || null
        })
        .eq('id', user.id)

    if (error) throw new Error('Failed to update profile')

    revalidatePath('/profil')
}
