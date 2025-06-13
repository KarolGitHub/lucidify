export interface RouteMeta {
  name: string;
  path: string;
  icon?: string;
  description?: string;
  category?: string;
  requiresAuth?: boolean;
}

export const appRoutes: RouteMeta[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: "fas fa-tv",
    description: "View your dream statistics and overview",
    category: "Main",
    requiresAuth: true,
  },
  {
    name: "Dream Journal",
    path: "/dream-journal",
    icon: "fas fa-moon",
    description: "Record and manage your dreams",
    category: "Main",
    requiresAuth: true,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: "fas fa-tools",
    description: "Manage your account and preferences",
    category: "Account",
    requiresAuth: true,
  },
  {
    name: "Home",
    path: "/",
    icon: "fas fa-home",
    description: "Welcome to Lucidify",
    category: "Main",
    requiresAuth: false,
  },
  {
    name: "Login",
    path: "/auth/login",
    icon: "fas fa-sign-in-alt",
    description: "Sign in to your account",
    category: "Auth",
    requiresAuth: false,
  },
  {
    name: "Register",
    path: "/auth/register",
    icon: "fas fa-user-plus",
    description: "Create a new account",
    category: "Auth",
    requiresAuth: false,
  },
  {
    name: "About",
    path: "/about",
    icon: "fas fa-info-circle",
    description: "Learn more about Lucidify",
    category: "Info",
    requiresAuth: false,
  },
];

// Helper function to search routes
export const searchRoutes = (query: string): RouteMeta[] => {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase();

  return appRoutes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchTerm) ||
      route.description?.toLowerCase().includes(searchTerm) ||
      route.path.toLowerCase().includes(searchTerm) ||
      route.category?.toLowerCase().includes(searchTerm),
  );
};

// Helper function to get route by path
export const getRouteByPath = (path: string): RouteMeta | undefined => {
  return appRoutes.find((route) => route.path === path);
};

// Helper function to get routes by category
export const getRoutesByCategory = (category: string): RouteMeta[] => {
  return appRoutes.filter((route) => route.category === category);
};

// Helper function to get authenticated routes only
export const getAuthenticatedRoutes = (): RouteMeta[] => {
  return appRoutes.filter((route) => route.requiresAuth);
};

// Helper function to get public routes only
export const getPublicRoutes = (): RouteMeta[] => {
  return appRoutes.filter((route) => !route.requiresAuth);
};
