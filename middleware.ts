import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(_request: NextRequest) {
  // Pass-through middleware to avoid build/runtime issues from incompatible imports
  return NextResponse.next();
}

export const config = {
  matcher: ["/consult/:path*", "/records/:path*", "/doctor/:path*"],
};