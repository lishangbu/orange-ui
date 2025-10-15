import type { MenuMixedOptions } from './helper'

export const routeRecordRaw: MenuMixedOptions[] = [
  {
    path: 'dashboard',
    name: 'dashboard',
    icon: 'iconify-[mage--dashboard-chart]',
    label: '仪表板',
    meta: {
      componentName: 'Dashboard',
      pinned: true,
      showTab: true,
    },
    component: 'dashboard/index',
  },
  {
    path: 'not-found-page-404',
    name: 'notfoundPage',
    icon: 'iconify-[streamline-freehand--server-error-404-not-found]',
    label: '404页面',
    meta: {
      componentName: 'notfoundPage404',
    },
    component: 'error-page/404',
  }
]
