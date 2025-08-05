const REMINDER_CACHE = "lattixiq-reminders-v1";

self.addEventListener("push", (event) => {
  const showNotification = async () => {
    try {
      if (!event.data) {
        console.error("Push event received without data");
        return;
      }

      const data = event.data.json();

      // Validate required fields
      if (!data.title || !data.body) {
        console.error("Push notification missing required fields", data);
        return;
      }

      const options = {
        body: data.body,
        icon: "/icon-192x192.png",
        badge: "/badge-72x72.png",
        tag: `reminder-${data.stepId || "default"}`,
        data: {
          url: data.deepLink || "/",
        },
        actions: [
          {
            action: "open-app",
            title: "Open LattixIQ",
          },
          {
            action: "dismiss",
            title: "Dismiss",
          },
        ],
        requireInteraction: true, // Keep notification visible until user interacts
      };

      await self.registration.showNotification(data.title, options);
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  };

  event.waitUntil(showNotification());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const handleClick = async () => {
    try {
      if (event.action === "open-app" || !event.action) {
        const url = event.notification.data?.url || "/";

        // Try to focus an existing window first
        const windowClients = await clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });

        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            await client.focus();
            return client.navigate(url);
          }
        }

        // If no existing window, open a new one
        return clients.openWindow(url);
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  event.waitUntil(handleClick());
});

// Handle messages from the client
self.addEventListener("message", (event) => {
  const handleMessage = async () => {
    try {
      if (event.data.type === "TEST_NOTIFICATION" || event.data.type === "SHOW_NOTIFICATION") {
        await self.registration.showNotification(event.data.title || "LattixIQ Reminder", {
          body: event.data.body || "Time to practice your plan",
          icon: "/icon-192x192.png",
          badge: "/badge-72x72.png",
          tag: event.data.tag || "test",
          data: {
            url: event.data.url || "/",
          },
        });
      }
    } catch (error) {
      console.error("Error handling message:", error);
      // Send error back to client if possible
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ error: error.message });
      }
    }
  };

  handleMessage();
});
