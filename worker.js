// ==========================================
// CRICKET SHORT V4 - FINAL WORKER
// SPORTMONKS LIVE + MATCH DETAILS
// ==========================================

export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    const headers = {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    };

    // HEALTH CHECK
    if (url.pathname === "/api/health") {

      return Response.json({
        success: true,
        app: "Cricket Short V4",
        connected: !!env.SPORTMONKS_API_TOKEN
      }, { headers });

    }

    // CHECK TOKEN
    if (!env.SPORTMONKS_API_TOKEN) {
      return Response.json({
        success: false,
        message: "SPORTMONKS_API_TOKEN Missing"
      }, { status: 500, headers });
    }

    // LIVE SCORE
    if (url.pathname === "/api/live-score") {

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
          signal: AbortSignal.timeout(15000)
        });

        const result = await response.json();

        if (!response.ok) {
          return Response.json({
            success: false,
            message: "Sportmonks Live API Error",
            error: result
          }, { status: 502, headers });
        }

        const matches = Array.isArray(result.data)
          ? result.data
          : [];

        return Response.json({
          success: true,
          totalMatches: matches.length,
          liveMatches: matches
        }, { headers });

      } catch (error) {

        return Response.json({
          success: false,
          message: error.message
        }, { status: 502, headers });

      }

    }

    // FULL MATCH DETAILS
    if (url.pathname === "/api/match-details") {

      const matchId = url.searchParams.get("id");

      if (!matchId || !/^\d+$/.test(matchId)) {

        return Response.json({
          success: false,
          message: "Valid Match ID Required"
        }, { status: 400, headers });

      }

      try {

        const apiUrl = new URL(
          `https://cricket.sportmonks.com/api/v2.0/fixtures/${matchId}`
        );

        apiUrl.searchParams.set(
          "api_token",
          env.SPORTMONKS_API_TOKEN
        );

        apiUrl.searchParams.set(
          "include",
          "localteam,visitorteam,venue,runs,scoreboards,batting,bowling,balls"
        );

        const response = await fetch(apiUrl, {
          signal: AbortSignal.timeout(15000)
        });

        const result = await response.json();

        if (!response.ok) {

          return Response.json({
            success: false,
            message: "Match Details API Error",
            error: result
          }, { status: 502, headers });

        }

        return Response.json({
          success: true,
          match: result.data || null
        }, { headers });

      } catch (error) {

        return Response.json({
          success: false,
          message: error.message
        }, { status: 502, headers });

      }

    }

    // STATIC WEBSITE
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Cricket Short V4 Online 🏏");

  }
};
