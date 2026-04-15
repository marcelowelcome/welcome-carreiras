import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

interface Ctx {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const payload = await request.json();
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("jobs").update(payload).eq("id", id);
  if (error) {
    console.error("[API] update job:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single();
  if (error) {
    console.error("[API] get job:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
