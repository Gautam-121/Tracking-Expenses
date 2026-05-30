
// A list of tasks to run before the process exits (e.g. closing DB)
const cleanupTasks = [];

/**
 * Registers a cleanup task to be run during shutdown.
 * Useful for other modules (like Database or Redis) to hook into the shutdown lifecycle.
 * 
 * @param {Function} task - An async function that performs cleanup.
 * 
 * @example
 * onShutdown(async () => await mongoose.connection.close());
 */
export const onShutdown = (task) => {
  cleanupTasks.push(task);
};

/**
 * The main shutdown logic. 
 * @param {import('http').Server} server - The running Express server instance.
 */
export const handleShutdown = (server) => {
  return async (signal) => {
    // Prevent multiple shutdown attempts
    if (handleShutdown.isShuttingDown) return;
    handleShutdown.isShuttingDown = true;

    console.info(`👋 ${signal} received. Starting graceful shutdown...`);

    // 1. Set a "Force Exit" timeout (Safety Net)
    // If things take too long (e.g. 20s), we kill the process anyway to prevent hanging.
    const forceExitTimeout = setTimeout(() => {
      console.error('⚠️ Shutdown timed out. Forcing exit...');
      process.exit(1);
    }, 20000);

    // Allow the process to exit even if this timeout is still running
    forceExitTimeout.unref();

    try {
      // 2. Load Balancer Sleep Phase (Zero-Downtime Deployment support)
      // Gives the orchestration system (k8s/AWS) time to remove this pod's IP from the routing table
      // so no new requests are routed here while we begin shutting down.
      if (process.env.NODE_ENV === 'production') {
        console.info('⏳ Waiting 3s for Load Balancer routing table updates...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      // 3. Stop accepting new HTTP requests & sever idle keep-alive sockets
      if (server) {
        console.info('🛑 Closing HTTP server (no new connections allowed)...');
        // Sever idle sockets (Keep-Alive) so server.close() doesn't hang indefinitely.
        // Requires Node.js >= 18.2.0
        if (typeof server.closeIdleConnections === 'function') {
          server.closeIdleConnections();
        }
        await new Promise((resolve, reject) => {
          server.close((err) => {
            if (err) {
              console.error('❌ Error closing HTTP server:', err);
              return reject(err);
            }
            console.info('✅ HTTP server closed. All active requests completed.');
            resolve();
          });
        });
      }

      // 4. Execute all registered cleanup tasks (DB, Redis, etc.)
      if (cleanupTasks.length > 0) {
        console.info(`🧹 Running ${cleanupTasks.length} cleanup tasks sequentially...`);
        // IMPORTANT: Run cleanups sequentially to respect dependency order
        // e.g. Workers -> DB -> Redis
        for (const [index, task] of cleanupTasks.entries()) {
          try {
            await task();
            console.info(`✅ Cleanup task ${index + 1}/${cleanupTasks.length} finished.`);
          } catch (error) {
            console.error(`❌ Cleanup task ${index + 1}/${cleanupTasks.length} failed:`, error);
          }
        }
      }
      console.info('🎊 Graceful shutdown successful. Goodbye!');
      process.exit(0);
    } catch (error) {
      console.error('💥 Critical error during shutdown:', error);
      process.exit(1);
    }
  };
};

// Internal state to prevent re-entry
handleShutdown.isShuttingDown = false;

export default handleShutdown;
