import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import Home from '@/pages/Home';

const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const ProjectPage = lazy(() => import('@/pages/ProjectPage'));
const BuildGuidePage = lazy(() => import('@/pages/BuildGuidePage'));
const SetupIndex = lazy(() => import('@/pages/SetupIndex'));
const SetupGuidePage = lazy(() => import('@/pages/SetupGuidePage'));
const ServicesIndex = lazy(() => import('@/pages/ServicesIndex'));
const ServicePage = lazy(() => import('@/pages/ServicePage'));
const FaqPage = lazy(() => import('@/pages/FaqPage'));
const TroubleshootingPage = lazy(() => import('@/pages/TroubleshootingPage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));
const HowThisSiteWorks = lazy(() => import('@/pages/HowThisSiteWorks'));
const Styleguide = lazy(() => import('@/pages/Styleguide'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/projects', element: <ProjectsPage /> },
      { path: '/projects/:slug', element: <ProjectPage /> },
      { path: '/projects/:slug/build', element: <BuildGuidePage /> },
      { path: '/setup', element: <SetupIndex /> },
      { path: '/setup/:slug', element: <SetupGuidePage /> },
      { path: '/services', element: <ServicesIndex /> },
      { path: '/services/:slug', element: <ServicePage /> },
      { path: '/faq', element: <FaqPage /> },
      { path: '/troubleshooting', element: <TroubleshootingPage /> },
      { path: '/progress', element: <ProgressPage /> },
      { path: '/how-this-site-works', element: <HowThisSiteWorks /> },
      { path: '/styleguide', element: <Styleguide /> },
      { path: '/404', element: <NotFound /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
