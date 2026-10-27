// =================================================
// CRICKET SHORT V4 - SPORTMONKS LIVE API
// =================================================

export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    const headers = {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    };

    // CORS
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          ...headers,
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    // HEALTH CHECK
    if (url.pathname === "/api/health") {

      return Response.json({
        success: true,
        app: "Cricket Short V4",
        api: "Sportmonks Cricket API",
        connected: !!env.SPORTMONKS_API_TOKEN,
        status: "ONLINE"
      }, { headers });
    }

    // LIVE SCORE
    if (url.pathname === "/api/live-score") {

      if (!env.SPORTMONKS_API_TOKEN) {
        return Response.json({
          success: false,
          message: "API TOKEN MISSING"
        }, {
          status: 500,
          headers
        });
      }

      try {

        const apiUrl = new URL(
          "https://cricket.sportmonks.com/api/v2.0/livescores"
        );

        apiUrl.searchParams.set(
          "api_token",
          env.SPORTMONKS_API_TOKEN
        );

        apiUrl.searchParams.set(
          "include",
          "localteam,visitorteam,league,venue,runs,scoreboards,batting,bowling,balls"
        );

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json"
          },
          signal: AbortSignal.timeout(15000)
        });

        const result = await response.json();

        // API ERROR
        if (!response.ok) {

          return Response.json({
            success: false,
            message: "SPORTMONKS API ERROR",
            httpStatus: response.status,
            error: result
          }, {
            status: 502,
            headers
          });
        }

        const matches = Array.isArray(result.data)
          ? result.data
          : [];

        return Response.json({

          success: true,

          app: "Cricket Short V4",

          provider: "Sportmonks",

          totalMatches: matches.length,

          liveMatches: matches,

          message: matches.length > 0
            ? "LIVE MATCH DATA RECEIVED"
            : "NO LIVE MATCH AVAILABLE IN YOUR API DATA"

        }, { headers });

      } catch (error) {

        return Response.json({

          success: false,

          message: "SPORTMONKS CONNECTION FAILED",

          error: error.message

        }, {
          status: 502,
          headers
        });

      }
    }

    // STATIC WEBSITE
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response(
      "Cricket Short V4 Online 🏏",
      { headers }
    );
  }
};
