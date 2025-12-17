import { NextResponse, type NextRequest } from 'next/server'
// import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    try {
        // Temporary bypass to debug Vercel 500 Error
        // return await updateSession(request)
        return NextResponse.next();
    } catch (e) {
        console.error('Middleware error:', e);
        // Fallback to allow request to proceed if middleware fails
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        });
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
