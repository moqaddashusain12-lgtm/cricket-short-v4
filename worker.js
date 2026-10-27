export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Health Check
    if (url.pathname === "/api/health") {
      return Response.json({
        success: true,
        app: "Cricket Short V4",
        sportmonksConfigured: !!env.SPORTMONKS_API_TOKEN
      });
    }

    // Sportmonks Live Score
    if (url.pathname === "/api/live-score") {
      if (!env.SPORTMONKS_API_TOKEN) {
        return Response.json({
          success: false,
          message: "SPORTMONKS_API_TOKEN Missing"
        }, { status: 500 });
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
          "runs,batting,bowling,localteam,visitorteam,venue"
        );

        const response = await fetch(apiUrl);
        const data = await response.json();

        return Response.json(data, {
          status: response.status,
          headers: {
            "Cache-Control": "no-store"
          }
        });

      } catch (error) {
        return Response.json({
          success: false,
          message: "Sportmonks API connection failed"
        }, { status: 502 });
      }
    }

    // Static Website
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Cricket Short V4 Online 🏏");
  }
};
