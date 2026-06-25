import { withAuth } from "next-auth/middleware";

// Explicit function export (Next.js 16 requires the middleware to be a
// directly-recognizable function, not a re-exported default).
export default withAuth(function middleware() {});

export const config = {
  matcher: ["/admin/:path*"],
};
