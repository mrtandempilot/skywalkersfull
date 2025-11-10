import { supabase } from '@/lib/supabase';
import type { 
  Customer, 
  Pilot, 
  TourPackage, 
  Communication, 
  CustomerInteraction, 
  Review,
  DashboardStats,
  BookingPipeline
} from '@/types/crm';

// ============================================
// CUSTOMERS
// ============================================

export async function getCustomers() {
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;

  // Get all bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('customer_email, total_amount, status');

  // Calculate total_spent and total_bookings for each customer
  const customersWithStats = customers?.map(customer => {
    const customerBookings = bookings?.filter(b => b.customer_email === customer.email) || [];
    const completedBookings = customerBookings.filter(b => b.status === 'completed');
    
    return {
      ...customer,
      total_bookings: customerBookings.length,
      total_spent: completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
    };
  }) || [];
  
  return customersWithStats as Customer[];
}

export async function getCustomerById(id: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Customer;
}

export async function createCustomer(customer: Partial<Customer>) {
  const { data, error } = await supabase
    .from('customers')
    .insert([customer])
    .select()
    .single();
  
  if (error) throw error;
  return data as Customer;
}

export async function updateCustomer(id: string, updates: Partial<Customer>) {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Customer;
}

export async function deleteCustomer(id: string) {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function searchCustomers(query: string) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Customer[];
}

// ============================================
// PILOTS
// ============================================

export async function getPilots() {
  const { data, error } = await supabase
    .from('pilots')
    .select('*')
    .order('first_name');
  
  if (error) throw error;
  return data as Pilot[];
}

export async function getActivePilots() {
  const { data, error } = await supabase
    .from('pilots')
    .select('*')
    .eq('status', 'active')
    .order('first_name');
  
  if (error) throw error;
  return data as Pilot[];
}

export async function getPilotById(id: string) {
  const { data, error } = await supabase
    .from('pilots')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Pilot;
}

export async function createPilot(pilot: Partial<Pilot>) {
  const { data, error } = await supabase
    .from('pilots')
    .insert([pilot])
    .select()
    .single();
  
  if (error) throw error;
  return data as Pilot;
}

export async function updatePilot(id: string, updates: Partial<Pilot>) {
  const { data, error } = await supabase
    .from('pilots')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Pilot;
}

// ============================================
// TOUR PACKAGES
// ============================================

export async function getTourPackages() {
  const { data, error } = await supabase
    .from('tour_packages')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data as TourPackage[];
}

export async function getActiveTourPackages() {
  const { data, error } = await supabase
    .from('tour_packages')
    .select('*')
    .eq('status', 'active')
    .order('name');
  
  if (error) throw error;
  return data as TourPackage[];
}

export async function createTourPackage(tourPackage: Partial<TourPackage>) {
  const { data, error } = await supabase
    .from('tour_packages')
    .insert([tourPackage])
    .select()
    .single();
  
  if (error) throw error;
  return data as TourPackage;
}

export async function updateTourPackage(id: string, updates: Partial<TourPackage>) {
  const { data, error } = await supabase
    .from('tour_packages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as TourPackage;
}

// ============================================
// COMMUNICATIONS
// ============================================

export async function getCommunicationsByCustomer(customerId: string) {
  const { data, error } = await supabase
    .from('communications')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Communication[];
}

export async function createCommunication(communication: Partial<Communication>) {
  const { data, error } = await supabase
    .from('communications')
    .insert([communication])
    .select()
    .single();
  
  if (error) throw error;
  return data as Communication;
}

// ============================================
// CUSTOMER INTERACTIONS
// ============================================

export async function getInteractionsByCustomer(customerId: string) {
  const { data, error } = await supabase
    .from('customer_interactions')
    .select('*')
    .eq('customer_id', customerId)
    .order('interaction_date', { ascending: false });
  
  if (error) throw error;
  return data as CustomerInteraction[];
}

export async function createInteraction(interaction: Partial<CustomerInteraction>) {
  const { data, error } = await supabase
    .from('customer_interactions')
    .insert([interaction])
    .select()
    .single();
  
  if (error) throw error;
  return data as CustomerInteraction;
}

export async function updateInteraction(id: string, updates: Partial<CustomerInteraction>) {
  const { data, error } = await supabase
    .from('customer_interactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as CustomerInteraction;
}

// ============================================
// REVIEWS
// ============================================

export async function getReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      customers:customer_id (first_name, last_name),
      pilots:pilot_id (first_name, last_name)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Review[];
}

export async function getPendingReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data as Review[];
}

export async function updateReview(id: string, updates: Partial<Review>) {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Review;
}

// ============================================
// DASHBOARD ANALYTICS
// ============================================

export async function getDashboardStats(): Promise<DashboardStats> {
  // Get date ranges
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  const lastMonth = new Date(today);
  lastMonth.setMonth(lastMonth.getMonth() - 2);

  // Get total customers
  const { count: totalCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true });

  // Get active customers
  const { count: activeCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Get VIP customers
  const { count: vipCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('vip_status', true);

  // Get total bookings
  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });

  // Get bookings data for revenue
  const { data: allBookings } = await supabase
    .from('bookings')
    .select('total_amount, booking_date, status, created_at');

  const completedBookings = allBookings?.filter((b: any) => b.status === 'completed') || [];
  const totalRevenue = completedBookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);
  const averageBookingValue = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

  // Today's stats
  const todayBookings = allBookings?.filter((b: any) => 
    new Date(b.booking_date) >= today
  ).length || 0;
  const todayRevenue = allBookings?.filter((b: any) => 
    new Date(b.booking_date) >= today && b.status === 'completed'
  ).reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0) || 0;

  // Week stats
  const weekBookings = allBookings?.filter((b: any) => 
    new Date(b.booking_date) >= weekAgo
  ).length || 0;
  const weekRevenue = allBookings?.filter((b: any) => 
    new Date(b.booking_date) >= weekAgo && b.status === 'completed'
  ).reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0) || 0;

  // Month stats
  const monthBookings = allBookings?.filter((b: any) => 
    new Date(b.booking_date) >= monthAgo
  ).length || 0;
  const monthRevenue = allBookings?.filter((b: any) => 
    new Date(b.booking_date) >= monthAgo && b.status === 'completed'
  ).reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0) || 0;

  // Last month stats for growth calculation
  const lastMonthBookings = allBookings?.filter((b: any) => {
    const date = new Date(b.booking_date);
    return date >= lastMonth && date < monthAgo;
  }).length || 0;

  const lastMonthRevenue = allBookings?.filter((b: any) => {
    const date = new Date(b.booking_date);
    return date >= lastMonth && date < monthAgo && b.status === 'completed';
  }).reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0) || 0;

  // Get pilots
  const { count: activePilots } = await supabase
    .from('pilots')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { data: pilotsData } = await supabase
    .from('pilots')
    .select('total_flights');
  
  const totalFlights = pilotsData?.reduce((sum: number, p: any) => sum + (p.total_flights || 0), 0) || 0;

  // Get reviews
  const { count: pendingReviews } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('overall_rating')
    .eq('status', 'approved');
  
  const averageRating = reviewsData && reviewsData.length > 0
    ? reviewsData.reduce((sum: number, r: any) => sum + r.overall_rating, 0) / reviewsData.length
    : 0;

  // Calculate growth percentages
  const revenueGrowth = lastMonthRevenue > 0 
    ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : monthRevenue > 0 ? 100 : 0;

  const bookingGrowth = lastMonthBookings > 0
    ? ((monthBookings - lastMonthBookings) / lastMonthBookings) * 100
    : monthBookings > 0 ? 100 : 0;

  // Customer growth
  const { data: newCustomers } = await supabase
    .from('customers')
    .select('created_at')
    .gte('created_at', monthAgo.toISOString());

  const { data: lastMonthCustomers } = await supabase
    .from('customers')
    .select('created_at')
    .gte('created_at', lastMonth.toISOString())
    .lt('created_at', monthAgo.toISOString());

  const customerGrowth = (lastMonthCustomers?.length || 0) > 0
    ? (((newCustomers?.length || 0) - (lastMonthCustomers?.length || 0)) / (lastMonthCustomers?.length || 0)) * 100
    : (newCustomers?.length || 0) > 0 ? 100 : 0;

  return {
    totalCustomers: totalCustomers || 0,
    totalBookings: totalBookings || 0,
    totalRevenue,
    averageBookingValue,
    
    todayBookings,
    todayRevenue,
    
    weekBookings,
    weekRevenue,
    
    monthBookings,
    monthRevenue,
    
    activeCustomers: activeCustomers || 0,
    vipCustomers: vipCustomers || 0,
    
    activePilots: activePilots || 0,
    totalFlights,
    
    pendingReviews: pendingReviews || 0,
    averageRating,
    
    revenueGrowth,
    bookingGrowth,
    customerGrowth,
  };
}

export async function getBookingPipeline(): Promise<BookingPipeline> {
  const { data: bookings } = await supabase
    .from('bookings')
    .select('status');

  const pipeline = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  };

  bookings?.forEach((booking: any) => {
    if (booking.status === 'pending') pipeline.pending++;
    else if (booking.status === 'confirmed') pipeline.confirmed++;
    else if (booking.status === 'completed') pipeline.completed++;
    else if (booking.status === 'cancelled') pipeline.cancelled++;
  });

  return pipeline;
}
