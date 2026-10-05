import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import RequireProfile from "./components/RequireProfile.jsx";

const App = lazy(() => import("./App.jsx"));
const Dashboard = lazy(() => import("./components/dashboard/Dashboard.jsx"));
const HRDashboard = lazy(() =>
  import("./components/dashboard/HRDashboard.jsx")
);
const PasswordResetEmail = lazy(() =>
  import("./components/PasswordResetEmail.jsx")
);
const ResetPassword = lazy(() => import("./components/ResetPassword.jsx"));
const ResetLinkSent = lazy(() => import("./components/ResetLinkSent.jsx"));
const BookingsDashboard = lazy(() =>
  import("./components/dashboard/BookingsDashboard.jsx")
);
const JobsDashboard = lazy(() =>
  import("./components/dashboard/JobsDashboard.jsx")
);
const AdHocJobsDashboard = lazy(() =>
  import("./components/dashboard/AdHocJobsDashboard.jsx")
);
const Onboarding = lazy(() => import("./components/Onboarding.jsx"));
const ClientManagementDashboard = lazy(() =>
  import("./components/dashboard/ClientManagementDashboard.jsx")
);
const MaintenanceDashboard = lazy(() =>
  import("./components/dashboard/MaintenanceDashboard.jsx")
);
const Properties = lazy(() => import("./components/Properties.jsx"));
const PropertyForm = lazy(() => import("./components/forms/PropertyForm.jsx"));
const OwnerForm = lazy(() => import("./components/forms/OwnerForm.jsx"));
const Owners = lazy(() => import("./components/Owners.jsx"));
const NotFound = lazy(() => import("./components/NotFound.jsx"));
const Settings = lazy(() => import("./components/Settings/Settings.jsx"));
const SettingsSystemPreferences = lazy(() =>
  import("./components/Settings/SettingsSystemPreferences.jsx")
);
const SettingsDataManagement = lazy(() =>
  import("./components/Settings/SettingsDataManagement.jsx")
);
const SettingsAccount = lazy(() =>
  import("./components/Settings/SettingsAccount.jsx")
);
const SettingsNotifications = lazy(() =>
  import("./components/Settings/SettingsNotifications.jsx")
);
const Employees = lazy(() => import("./components/Employees.jsx"));
const BookingForm = lazy(() => import("./components/forms/BookingForm.jsx"));
const FullScreenCalendar = lazy(() =>
  import("./components/FullScreenCalendar.jsx")
);
const LeadDetails = lazy(() => import("./components/LeadDetails.jsx"));
const AuthPage = lazy(() => import("./components/AuthPage.jsx"));
const Login = lazy(() => import("./components/Login.jsx"));
const SignUp = lazy(() => import("./components/SignUp.jsx"));
const HomeRedirect = lazy(() => import("./components/HomeRedirect.jsx"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute.jsx"));

// Exported as a standalone module (rather than defined inline in main.jsx)
// so non-component code - specifically AuthProvider's onAuthStateChange
// listener - can call router.navigate() imperatively (e.g. to force a
// PASSWORD_RECOVERY session straight to /reset-password) without a
// circular import back to main.jsx.
export const router = createBrowserRouter([
  {
    path: "/", // base route
    element: <HomeRedirect />,
    errorElement: <NotFound />,
  },
  {
    element: <AuthPage />,
    children: [
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "forgot-password",
        element: <PasswordResetEmail />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "reset-link-sent",
        element: <ResetLinkSent />,
      },
    ],
  },
  { path: "onboarding", element: <Onboarding /> },
  {
    path: "/",
    element: <ProtectedRoute />,
    errorElement: <NotFound />,
    children: [
      {
        element: <RequireProfile />, // <- New layer here
        children: [
          {
            element: <App />, // App holds your nav + <Outlet />
            children: [
              { index: true, element: <Dashboard /> },
              { path: "Dashboard", element: <Dashboard /> },
              { path: "Jobs", element: <JobsDashboard /> },
              {
                path: "Jobs/Bookings",
                element: <BookingsDashboard />,
              },
              {
                path: "Jobs/Bookings/New-Booking",
                element: <BookingForm />,
              },
              {
                path: "Jobs/Bookings/:bookingId",
                element: <BookingForm />,
              },
              {
                path: "Jobs/Ad-hoc-Jobs",
                element: <AdHocJobsDashboard />,
              },
              {
                path: "Client-Management",
                element: <ClientManagementDashboard />,
              },
              {
                path: "Client-Management/Properties",
                element: <Properties />,
              },
              {
                path: "Client-Management/Properties/:name",
                element: <PropertyForm />,
              },
              {
                path: "Client-Management/Properties/New-Property",
                element: <PropertyForm />,
              },
              {
                path: "Client-Management/Owners/New-Owner",
                element: <OwnerForm />,
              },
              {
                path: "Client-Management/Owners",
                element: <Owners />,
              },
              {
                path: "Client-Management/Owners/:id",
                element: <OwnerForm />,
              },
              {
                path: "Client-Management/Leads/:title",
                element: <LeadDetails />,
              },
              {
                path: "Settings",
                element: <Settings />,
                children: [
                  {
                    path: "General",
                    element: <div>General Settings</div>,
                  },
                  { path: "Account", element: <SettingsAccount /> },
                  {
                    path: "System-Preferences",
                    element: (
                      <div>
                        <SettingsSystemPreferences />
                      </div>
                    ),
                  },
                  {
                    path: "Data-Management",
                    element: <div>Data Management</div>,
                  },
                  {
                    path: "Notifications",
                    element: <SettingsNotifications />,
                  },
                  { path: "Admin", element: <div>Admin Settings</div> },
                ],
              },
              {
                path: "Maintenance",
                element: <MaintenanceDashboard />,
              },
              {
                path: "Human-Resources",
                element: <HRDashboard />,
              },
              {
                path: "Human-Resources/Employees",
                element: <Employees />,
              },
              { path: "Calendar", element: <FullScreenCalendar /> },
            ],
          },
        ],
      },
    ],
  },
]);
