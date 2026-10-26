export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Health Check
    if (url.pathname === "/api/health") {
      return Response.json({
        success: true,
        app: "Cricket Short V4",
        status: "Online",
        apiConfigured: !!env.CRICKET_API_KEY
      });
    }

    // Real Cricket Live Score
    if (url.pathname === "/api/live-score") {
      if (!env.CRICKET_API_KEY) {
        return Response.json({
          success: false,
          message: "API Key Missing"
        }, { status: 500 });
      }

      try {
        const apiUrl = new URL(
          "https://api.cricapi.com/v1/currentMatches"
        );

        apiUrl.searchParams.set("apikey", env.CRICKET_API_KEY);
        apiUrl.searchParams.set("offset", "0");

        const response = await fetch(apiUrl);
        const data = await response.json();

        return Response.json(data, {
          headers: {
            "Cache-Control": "public, max-age=60"
          }
        });

      } catch (error) {
        return Response.json({
          success: false,
          message: "Cricket API Error"
        }, { status: 500 });
      }
    }

    // Website Files
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Cricket Short V4 Online 🏏");
  }
};
