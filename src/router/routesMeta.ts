export interface RouteMeta {
  name: string;
  path: string;
  icon?: string;
  description?: string;
  category?: string;
}

export const appRoutes: RouteMeta[] = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: "fas fa-tv",
    description: "View your dream statistics and overview",
    category: "Main",
  },
  {
    name: "Dream Journal",
    path: "/dream-journal",
    icon: "fas fa-moon",
    description: "Record and manage your dreams",
    category: "Main",
  },
  {
    name: "Settings",
    path: "/settings",
    icon: "fas fa-tools",
    description: "Manage your account and preferences",
    category: "Account",
  },
  {
    name: "About",
    path: "/about",
    icon: "fas fa-info-circle",
    description: "Learn more about Lucidifier",
    category: "Info",
  },
  {
    name: "Login",
    path: "/auth/login",
    icon: "fas fa-sign-in-alt",
    description: "Sign in to your account",
    category: "Auth",
  },
  {
    name: "Register",
    path: "/auth/register",
    icon: "fas fa-user-plus",
    description: "Create a new account",
    category: "Auth",
  },
  {
    name: "Home",
    path: "/",
    icon: "fas fa-home",
    description: "Welcome to Lucidifier",
    category: "Main",
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
