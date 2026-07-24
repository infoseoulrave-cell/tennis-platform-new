import { NextRequest, NextResponse } from "next/server";
import { stateTransitionSchema } from "@/modules/catalog/validation";
import { transitionSpecState } from "@/modules/catalog/ingestion";
import { isAdminRequest, unauthorizedAdminResponse } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) return unauthorizedAdminResponse();

  const { id } = await params;
  const body = await request.json();
  const parsed = stateTransitionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await transitionSpecState(id, parsed.data.targetState, parsed.data.comment);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  if (parsed.data.targetState === "published") {
    revalidatePath("/");
  }

  return NextResponse.json({ ok: true });
}
