import { Routes } from "@angular/router";
import { environment } from "./environment";
import { AuthGuard } from "../services/auth-guard";

// 公共路由
export const shareRoutes: Routes = [
  // 没有权限的显示模块
  {
    path: "no-auth",
    loadChildren: () =>
      import("../main/no-auth/no-auth.module").then(x => x.NoAuthModule)
  },
  // 错误的路由或不存在的路由指向的模块
  {
    path: "**",
    loadChildren: () =>
      import("../main/exception/404.module").then(x => x.Exception404Module)
  }
];

// 顶级路由，指向框架页
export const mainRoutes: Routes = [
  // 登录页
  {
    path: "login",
    loadChildren: () =>
      import("../main/login/login.module").then(x => x.LoginModule)
  },
    // index
    {
      path: "index",
      loadChildren: () =>
        import("../layout/index/index.module").then(x => x.IndexModule),
      canActivateChild: [AuthGuard]
      // canLoad: [AuthGuard]
    },
  {
    path: "home",
    loadChildren: () =>
      import("../main/start/home/home.module").then(x => x.HomeModule)
  },
  {
    path: "search",
    loadChildren: () =>
      import("../main/start/search/search.module").then(x => x.SearchModule)
  },
  {
    path: "image",
    loadChildren: () =>
      import("../main/start/image/image.module").then(x => x.ImageModule)
  },
  {
    path: "video",
    loadChildren: () =>
      import("../main/start/video/video.module").then(x => x.VideoModule)
  },
  {
    path: "document",
    loadChildren: () =>
      import("../main/start/document/document.module").then(x => x.DocumentModule)
  },
  {
    path: "map",
    loadChildren: () =>
      import("../main/start/map/map.module").then(x => x.MapModule)
  },


  // 如果路由为空就指向 index
  { path: "", redirectTo: environment.layout, pathMatch: "full" },

  ...shareRoutes
];

// 框架页中对应的路由，指向具体的页面，框架页面中的路由都会带上顶级路由 index 如：/index/workplace
export const layoutRoutes: Routes = [

  // 仪表盘
  {
    path: "dashboard",
    loadChildren: () =>
      import("../main/dashboard/dashboard.module").then(x => x.DashboardModule),
    canLoad: [AuthGuard],
    data: {
      title: "dashboard"
    }
  },
  // 仪表盘
  {
    path: "graph",
    loadChildren: () =>
      import("../main/graph/graph.module").then(x => x.GraphModule),
    canLoad: [AuthGuard],
    data: {
      title: "graph"
    }
  },
  // 仪表盘
  {
    path: "map",
    loadChildren: () =>
      import("../main/map/map.module").then(x => x.MapModule),
    canLoad: [AuthGuard],
    data: {
      title: "map"
    }
  },
  // 用户管理
  {
    path: "users",
    loadChildren: () =>
      import("../main/system/users/users.module").then(x => x.UsersModule),
    canLoad: [AuthGuard],
    data: {
      title: "users"
    }
  },
  // 角色管理
  {
    path: "roles",
    loadChildren: () =>
      import("../main/system/roles/roles.module").then(x => x.RolesModule),
    canLoad: [AuthGuard],
    data: {
      shouldReuse: true
    }
  },
  // 组织管理
  {
    path: "organization",
    loadChildren: () =>
      import("../main/system/organization/organization.module").then(
        x => x.OrganizationModule
      ),
    canLoad: [AuthGuard],
    data: {
      shouldReuse: true
    }
  },
  // 菜单管理
  {
    path: "menus",
    loadChildren: () =>
      import("../main/system/menus/menus.module").then(x => x.MenusModule),
    canLoad: [AuthGuard],
    data: {
      shouldReuse: true
    }
  },

  // 本体
  {
    path: "ontology",
    loadChildren: () =>
      import("../main/ontology/ontology/ontology.module").then(x => x.OntologyModule),
    canLoad: [AuthGuard],
    data: {
      shouldReuse: true
    }
  },

  // 属性
  {
    path: "property",
    loadChildren: () =>
      import("../main/ontology/property/property.module").then(x => x.PropertyModule),
    canLoad: [AuthGuard],
    data: {
      shouldReuse: true
    }
  },

  // 属性
  {
    path: "qualify",
    loadChildren: () =>
      import("../main/ontology/qualify/qualify.module").then(x => x.QualifyModule),
    canLoad: [AuthGuard],
    data: {
      shouldReuse: true
    }
  },

  // 标签
  {
    path: "tag",
    loadChildren: () =>
      import("../main/ontology/tag/tag.module").then(x => x.TagModule),
    canLoad: [AuthGuard],
    data: {
      shouldReuse: true
    }
  },
  // 数据集
  {
    path: "dataset",
    loadChildren: () =>
      import("../main/dataset/dataset.module").then(
        x => x.DatasetModule
      ),
    canLoad: [AuthGuard],
    data: {
      shouldReuse: true
    }
  },
  // 数据集
  {
    path: "algorithm",
    loadChildren: () =>
      import("../main/algorithm/algorithm.module").then(
        x => x.AlgorithmModule
      ),
    canLoad: [AuthGuard],
    data: {
      shouldReuse: true
    }
  },
  // 抽取
  {
    path: "extraction",
    loadChildren: () =>
      import("../main/extraction/extraction.module").then(
        x => x.ExtractionModule
      ),
    canLoad: [AuthGuard],
    data: {
      shouldReuse: true
    }
  },
  {
    path: "applications",
    loadChildren: () =>
      import("../main/ontology/application/application.module").then(x => x.ApplicationModule),
    // canLoad: [AuthGuard],
    data: {
      shouldReuse: true
    }
  },

  {
    path: "entity",
    loadChildren: () =>
      import("../main/entity/entity.module").then(x => x.EntityModule),
    // canLoad: [AuthGuard],
    data: {
      shouldReuse: true
    }
  },
  {
    path: "application",
    loadChildren: () =>
      import("../main/application/application.module").then(x => x.ApplicationModule),
    // canLoad: [AuthGuard],
    data: {
      shouldReuse: true
    }
  },

  // 示例功能
  // { path: 'examples', loadChildren: 'src/main/examples/example.module#ExampleModule', canLoad: [AuthGuard] },
  // // 工作型首页
  // { path: 'workplace', loadChildren: 'src/main/dashboard/workplace/workplace.module#WorkplaceModule', canLoad: [AuthGuard] },
  // // 数据型首页
  // { path: 'analysis', loadChildren: 'src/main/dashboard/analysis/analysis.module#AnalysisModule' },
  // // 账号管理
  // { path: 'account', loadChildren: 'src/main/system/account/account.module#AccountModule', canLoad: [AuthGuard] },
  // // 角色管理
  // { path: 'role', loadChildren: 'src/main/system/role/role.module#RoleModule', canLoad: [AuthGuard] },
  // // 菜单管理
  // { path: 'menu', loadChildren: 'src/main/system/menu/menu.module#MenuModule', canLoad: [AuthGuard] },
  // // 组织管理
  // { path: 'organization', loadChildren: 'src/main/system/organization/organization.module#OrganizationModule', canLoad: [AuthGuard] },
  // // 模块设计
  // { path: 'module', loadChildren: 'src/main/module/module.module#ModuleModule', canLoad: [AuthGuard] },

  // 如果路由为空就指向配置的默认首页
  { path: "", redirectTo: environment.defaultPage, pathMatch: "full" },

  ...shareRoutes
];
