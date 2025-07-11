import { RouteRecordRaw } from "vue-router";

const Dashboard = () => import("@/views/dashboard/Dashboard.vue");
const Settings = () => import("@/views/settings/Settings.vue");
const DreamJournal = () => import("@/views/dream-journal/DreamJournal.vue");
const RealityCheck = () => import("@/views/RealityCheck.vue");
const Login = () => import("@/views/auth/login/Login.vue");
const Register = () => import("@/views/auth/register/Register.vue");
const About = () => import("@/views/About.vue");
const Auth = () => import("@/layout/Auth.vue");
const Layout = () => import("@/layout/Layout.vue");
const Home = () => import("@/views/home/Home.vue");
const CustomNotifications = () =>
  import("@/components/CustomNotifications.vue");

const routes: Array<RouteRecordRaw> = [
  {
    path: "",
    redirect: "/dashboard",
    component: Layout,
    children: [
      {
        path: "/dashboard",
        name: "Dashboard",
        component: Dashboard,
      },
      {
        path: "/",
        name: "home",
        component: Home,
      },
      {
        path: "/dream-journal",
        name: "DreamJournal",
        component: DreamJournal,
      },
      {
        path: "/reality-check",
        name: "RealityCheck",
        component: RealityCheck,
      },
      {
        path: "/settings",
        component: Settings,
      },
      {
        path: "/notifications",
        name: "CustomNotifications",
        component: CustomNotifications,
      },
    ],
  },
  {
    path: "/auth",
    redirect: "/auth/login",
    component: Auth,
    children: [
      {
        path: "/auth/login",
        name: "login",
        component: Login,
      },
      {
        path: "/auth/register",
        name: "register",
        component: Register,
      },
    ],
  },
  {
    path: "/about",
    component: About,
  },
  { path: "/:pathMatch(.*)*", redirect: "/auth/login" },
];

export default routes;
