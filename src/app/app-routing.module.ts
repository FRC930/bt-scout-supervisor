import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TabsComponent } from './tabs.component';

const routes: Routes = [
  {
    path: '',
    component: TabsComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/dashboard/dashboard.module').then((m) => m.DashboardPageModule),
      },
      {
        path: 'builder',
        loadChildren: () => import('./pages/builder/builder.module').then((m) => m.BuilderPageModule),
      },
      {
        path: 'match-scout',
        loadChildren: () => import('./pages/match-scout/match-scout.module').then((m) => m.MatchScoutPageModule),
      },
      {
        path: 'export',
        loadChildren: () => import('./pages/export/export.module').then((m) => m.ExportPageModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
