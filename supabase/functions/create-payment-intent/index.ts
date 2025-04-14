
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
    const { amount, description, paymentMethodId } = await req.json();
    
    // Validate request data
    if (!amount || amount <= 0) {
      throw new Error("Invalid payment amount");
    }

    // Get user info from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Authentication failed");
    }

    // Create or retrieve Stripe customer
    let customerId;
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const customerEmail = user.email;
    const customerName = profiles?.full_name || "Tenant";

    // Check if customer already exists
    const customers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    });

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new customer if none exists
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
      });
      customerId = customer.id;
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "cad",
      customer: customerId,
      description: description || "Rent payment",
      payment_method: paymentMethodId,
      confirm: !!paymentMethodId,
      automatic_payment_methods: !paymentMethodId ? {
        enabled: true,
        allow_redirects: "never",
      } : undefined,
    });

    // Record the payment in the database
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        tenant_id: profiles?.property_id ? null : user.id, // Use tenant_id if available
        tenant_user_id: user.id,
        amount: amount,
        method: "credit card",
        status: "pending",
        date: new Date().toISOString().split("T")[0],
        payment_intent_id: paymentIntent.id,
        notes: "Payment via Stripe"
      })
      .select("*")
      .single();

    if (paymentError) {
      console.error("Error recording payment:", paymentError);
    }

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentId: payment?.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment intent error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
