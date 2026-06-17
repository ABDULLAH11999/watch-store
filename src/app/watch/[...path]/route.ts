import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  const { path } = params;
  return NextResponse.redirect(new URL(`/watches/${path.join("/")}`, request.url), 308);
}
