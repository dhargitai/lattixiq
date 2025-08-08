const SCREEN_NAMES = {
  "/toolkit": "My Toolkit",
  "/settings": "Settings",
  "/roadmap/[id]": "Your Roadmap",
  "/learn/[id]": "Learn",
  "/plan/[id]": "Plan",
  "/reflect/[id]": "Reflect",
  "/new-roadmap": "Create New Roadmap",
  "/unlocked/[slug]": "Unlocked Knowledge",
  "/pricing": "Pricing",
  "/application-log": "Application Log",
};

const HELP_CONTENT_IDS = {
  "/toolkit": "toolkit-screen-help",
  "/settings": "settings-screen-help",
  "/roadmap/[id]": "roadmap-screen-help",
  "/learn/[id]": "learn-screen-help",
  "/plan/[id]": "plan-screen-help",
  "/reflect/[id]": "reflect-screen-help",
  "/new-roadmap": "new-roadmap-screen-help",
  "/unlocked/[slug]": "unlocked-screen-help",
  "/pricing": "pricing-screen-help",
  "/application-log": "application-log-screen-help",
};

export function getScreenInfo(pathname: string): {
  name: string;
  helpContentId: string;
} {
  // Handle dynamic routes
  if (pathname.startsWith("/roadmap/")) {
    return {
      name: SCREEN_NAMES["/roadmap/[id]"],
      helpContentId: HELP_CONTENT_IDS["/roadmap/[id]"],
    };
  }

  if (pathname.startsWith("/learn/")) {
    return {
      name: SCREEN_NAMES["/learn/[id]"],
      helpContentId: HELP_CONTENT_IDS["/learn/[id]"],
    };
  }

  if (pathname.startsWith("/plan/")) {
    return {
      name: SCREEN_NAMES["/plan/[id]"],
      helpContentId: HELP_CONTENT_IDS["/plan/[id]"],
    };
  }

  if (pathname.startsWith("/reflect/")) {
    return {
      name: SCREEN_NAMES["/reflect/[id]"],
      helpContentId: HELP_CONTENT_IDS["/reflect/[id]"],
    };
  }

  if (pathname.startsWith("/unlocked/")) {
    return {
      name: SCREEN_NAMES["/unlocked/[slug]"],
      helpContentId: HELP_CONTENT_IDS["/unlocked/[slug]"],
    };
  }

  // Handle exact matches
  const exactMatch = SCREEN_NAMES[pathname as keyof typeof SCREEN_NAMES];
  if (exactMatch) {
    return {
      name: exactMatch,
      helpContentId: HELP_CONTENT_IDS[pathname as keyof typeof HELP_CONTENT_IDS],
    };
  }

  // Fallback for unknown routes
  return {
    name: "Page",
    helpContentId: "general-help",
  };
}
