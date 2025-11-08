import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch provider with related data
    const { data: provider, error: providerError } = await supabase
      .from('provider_profiles')
      .select(`
        *,
        user:users!provider_profiles_user_id_fkey(*),
        education(*),
        certifications(*),
        services(*)
      `)
      .eq('id', id)
      .single();

    if (providerError || !provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Fetch reviews separately
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        *,
        customer:users!reviews_customer_id_fkey(*)
      `)
      .eq('provider_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (reviewsError) {
      console.error('Reviews error:', reviewsError);
    }

    return NextResponse.json({
      provider,
      reviews: reviews || [],
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
