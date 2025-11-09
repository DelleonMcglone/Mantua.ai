import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    console.log("🚀 Starting Mantua Protocol server...");
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 Database URL: ${process.env.DATABASE_URL ? 'configured ✅' : 'not set ⚠️'}`);

    const server = await registerRoutes(app);
    console.log("✅ Routes registered successfully");

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.error("❌ Error handler caught:", {
        status,
        message,
        stack: err.stack,
      });

      res.status(status).json({ message });
    });

    if (app.get("env") === "development") {
      console.log("🔧 Setting up Vite for development...");
      await setupVite(app, server);
      console.log("✅ Vite setup complete");
    } else {
      console.log("📦 Serving static files for production...");
      serveStatic(app);
      console.log("✅ Static files configured");
    }

    const port = parseInt(process.env.PORT || '5000', 10);
    const host = "0.0.0.0";

    server.listen({
      port,
      host,
      reusePort: true,
    }, () => {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`✅ Mantua Protocol server is running!`);
      console.log(`🌐 Host: ${host}`);
      console.log(`🔌 Port: ${port}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      log(`serving on port ${port}`);
    });

    server.on('error', (err: any) => {
      console.error("❌ Server error:", err);
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error("❌ Fatal error during server startup:");
    console.error(error);
    process.exit(1);
  }
})();

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
