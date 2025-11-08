import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { ProviderFilters } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from query parameters
    const filters: ProviderFilters = {
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      specialties: searchParams.get('specialties')?.split(',').filter(Boolean) || undefined,
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      verified: searchParams.get('verified') === 'true' ? true : undefined,
      insurance: searchParams.get('insurance')?.split(',').filter(Boolean) || undefined,
      search: searchParams.get('search') || undefined,
    };

    // Build query
    let query = supabase
      .from('provider_profiles')
      .select(`
        *,
        user:users!provider_profiles_user_id_fkey(*)
      `);

    // Apply filters
    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.state) {
      query = query.eq('state', filters.state);
    }

    if (filters.minRating) {
      query = query.gte('average_rating', filters.minRating);
    }

    if (filters.minPrice) {
      query = query.gte('price_min', filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte('price_max', filters.maxPrice);
    }

    if (filters.verified !== undefined) {
      query = query.eq('verified', filters.verified);
    }

    // Handle array filters (specialties, insurance)
    if (filters.specialties && filters.specialties.length > 0) {
      query = query.overlaps('specialties', filters.specialties);
    }

    if (filters.insurance && filters.insurance.length > 0) {
      query = query.overlaps('insurance_accepted', filters.insurance);
    }

    // Text search (business name, title, bio)
    if (filters.search) {
      query = query.or(
        `business_name.ilike.%${filters.search}%,title.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`
      );
    }

    // Order by rating and review count
    query = query.order('average_rating', { ascending: false });
    query = query.order('review_count', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch providers' },
        { status: 500 }
      );
    }

    return NextResponse.json({ providers: data || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
