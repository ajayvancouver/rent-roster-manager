
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const supabaseUrl = "https://noxdsmplywvhcdbqkxds.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentIntentId, paymentId } = await req.json();
    
    if (!paymentIntentId) {
      throw new Error("Missing payment intent ID");
    }

    // Get the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Map Stripe status to our status
    let status;
    if (paymentIntent.status === 'succeeded') {
      status = 'completed';
    } else if (paymentIntent.status === 'processing') {
      status = 'pending';
    } else if (['canceled', 'requires_payment_method'].includes(paymentIntent.status)) {
      status = 'failed';
    } else {
      status = 'pending';
    }
    
    // Update the payment status in our database
    const { data, error } = await supabase
      .from('payments')
      .update({ status })
      .eq(paymentId ? 'id' : 'payment_intent_id', paymentId || paymentIntentId)
      .select('*')
      .single();
    
    if (error) {
      throw new Error(`Error updating payment: ${error.message}`);
    }
    
    // Update user balance in profiles table if payment is successful
    if (status === 'completed' && data.tenant_user_id) {
      const amount = data.amount;
      
      // Get current profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', data.tenant_user_id)
        .single();
      
      if (!profileError && profile) {
        // Update balance (subtract payment amount from balance)
        const newBalance = (profile.balance || 0) - amount;
        
        await supabase
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', data.tenant_user_id);
      }
    }
    
    return new Response(
      JSON.stringify({ status, payment: data }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment status update error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
