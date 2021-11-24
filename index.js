// allowed options http headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,DELETE',
    'Access-Control-Max-Age': '86400',
}

const API_URL = 'https://api.cloudflare.com'

// restrict API access to deployments and accounts listings to get the account id
// -> this restriction should partly prevent abuse if credentials are leaked over sanity in the browser
//    or someone is able to inject proper code into the sanity studio
//    this has no effect if credentials are leaked as one could simply use e.g. postman or some self written code to do the requests
// according to this, following urls are fine:
// - https://api.cloudflare.com/api/v4/accounts/sfjhfof8u79s7df/pages/projects/some-project/deployments... - for deployment manipulation
// - https://api.cloudflare.com/api/v4/accounts - to get the account id from email and api-key
// If we assume the incoming URL can have some subdomain or subpath before, we check if the end of the paths matches the following regular expression:
const allowedPathsRegex = new RegExp(
    /\/api\/v4\/accounts(\/[A-Za-z0-9_.-]+\/pages\/projects\/[A-Za-z0-9_.-]+\/deployments(\/projects\/[A-Za-z0-9_.-]+)?)?$/
)

function handleOptions(request) {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    let headers = request.headers

    if (
        headers.get('Origin') !== null &&
        headers.get('Access-Control-Request-Method') !== null &&
        headers.get('Access-Control-Request-Headers') !== null
    ) {
        // Handle CORS pre-flight request.
        // If you want to check or reject the requested method + headers
        // you can do that here.
        let respHeaders = {
            ...corsHeaders,
            // Allow all future content Request headers to go back to browser
            // such as Authorization (Bearer) or X-Client-Name-Version
            'Access-Control-Allow-Headers': request.headers.get(
                'Access-Control-Request-Headers'
            ),
        }

        return new Response(null, {
            headers: respHeaders,
        })
    } else {
        // Handle standard OPTIONS request.
        // If you want to allow other HTTP Methods, you can do that here.
        return new Response(null, {
            headers: {
                Allow: 'GET, HEAD, POST, OPTIONS',
            },
        })
    }
}

async function handleRequest(request) {
    const url = new URL(request.url)

    // Rewrite request to point to API url. This also makes the request mutable
    // so we can add the correct Origin header to make the API server think
    // that this request isn't cross-site.
    request = new Request(API_URL + url.pathname, request)
    request.headers.set('Origin', new URL(API_URL).origin)
    let response = await fetch(request)

    // Recreate the response so we can modify the headers
    response = new Response(response.body, response)

    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*')

    // Append to/Add Vary header so browser will cache response correctly
    response.headers.append('Vary', 'Origin')

    return response
}

addEventListener('fetch', event => {
    const request = event.request

    const url = new URL(request.url)

    // only passthrough accounts and deployments endpoints
    if (url.pathname.match(allowedPathsRegex)) {
        // OPTIONS necessary for CORS check - browser do this first
        if (request.method === 'OPTIONS') {
            // Handle CORS preflight requests
            event.respondWith(handleOptions(request))
        } else if (
            request.method === 'GET' ||
            request.method === 'DELETE' ||
            request.method === 'POST'
        ) {
            // Handle requests to the API server
            event.respondWith(handleRequest(request))
        } else {
            // other methods are not allowed
            event.respondWith(
                new Response(null, {
                    status: 405,
                    statusText: 'Method Not Allowed',
                })
            )
        }
    } else {
        // all other API requests are forbidden
        event.respondWith(
            new Response(null, {
                status: 403,
                statusText: 'Forbidden',
            })
        )
    }
})
