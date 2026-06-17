import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  const { path } = params;
  const segments = path.join("/");
  const target = segments.startsWith("testimonials/")
    ? `/testimonials/${segments.replace(/^testimonials\//, "")}`
    : `/watches/${segments.replace(/^(products|watch)\//, "")}`;

  return NextResponse.redirect(new URL(target, request.url), 308);
}
