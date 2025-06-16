import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartComponent } from './start.component';

const routes: Routes = [
  {
    path: '',
    component: StartComponent,
    children: [

      {
        path: "search",
        loadChildren: () =>
          import("./search/search.module").then(x => x.SearchModule)
      },

      {
        path: "knowledge",
        loadChildren: () =>
          import("./knowledge/knowledge.module").then(x => x.KnowledgeModule)
      },
      {
        path: "wiki",
        loadChildren: () =>
          import("./wiki/wiki.module").then(x => x.WikiModule)
      },
      {
        path: "ai-search",
        loadChildren: () =>
          import("./ai-search/ai-search.module").then(x => x.AiSearchModule)
      },
      {
        path: "image",
        loadChildren: () =>
          import("./image/image.module").then(x => x.ImageModule)
      },
      {
        path: "video",
        loadChildren: () =>
          import("./video/video.module").then(x => x.VideoModule)
      },
      {
        path: "document",
        loadChildren: () =>
          import("./document/document.module").then(x => x.DocumentModule)
      },
      {
        path: "map",
        loadChildren: () =>
          import("./map/map.module").then(x => x.MapModule)
      },
      {
        path: "addons",
        loadChildren: () =>
          import("./addons/addons.module").then(x => x.addonsModule)
      },
    ]
  },

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StartRoutesModule { }
