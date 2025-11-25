import { CicdDashboard } from './client/CicdDashboard';

export const routes = [
  {
    path: '/cicd',
    component: CicdDashboard,
    exact: true,
    meta: {
      title: 'CI/CD',
      icon: '🚀',
    },
  },
];
