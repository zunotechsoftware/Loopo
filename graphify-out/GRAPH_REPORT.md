# Graph Report - .  (2026-07-20)

## Corpus Check
- Corpus is ~39,322 words - fits in a single context window. You may not need a graph.

## Summary
- 136 nodes · 39 edges · 98 communities (6 shown, 92 thin omitted)
- Extraction: 21% EXTRACTED · 79% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- iOS & macOS Icons & Branding
- Android Icons & SVG Branding
- Flutter Setup & Platform Configs
- Backend Infrastructure & Checklists
- iOS Launch Screens & Configurations
- Graphify Knowledge Graph Rules
- Appcontroller Controller
- Appmodule Module
- Appservice Service
- Addressesmodule Module
- Addressescontroller Module
- Createaddressdto Module
- Updateaddressdto Module
- Addressesrepository Module
- Addressesservice Module
- Auditlogsmodule Module
- Auditlogsrepository Module
- Auditlogsservice Module
- Authmodule Module
- Authcontroller Module
- Forgotpassworddto Module
- Logindto Module
- Refreshtokendto Module
- Registerdto Module
- Resetpassworddto Module
- Sociallogindto Module
- Verifyemaildto Module
- Verifyotpdto Module
- Authrepository Module
- Authservice Module
- Applestrategy Module
- Googlestrategy Module
- Jwtrefreshstrategy Module
- Jwtstrategy Module
- Localstrategy Module
- Adminkyccontroller Module
- Kyccontroller Module
- Createkycdto Module
- Rejectkycdto Module
- Updatekycdto Module
- Kycmodule Module
- Kycrepository Module
- Kycservice Module
- Notificationsettingscontroller Module
- Updatenotificationsettingsdto Module
- Notificationsettingsmodule Module
- Notificationsettingsrepository Module
- Notificationsettingsservice Module
- Permissionscontroller Module
- Rolescontroller Module
- Userrolescontroller Module
- Createpermissiondto Module
- Updatepermissiondto Module
- Assignroledto Module
- Createroledto Module
- Updateroledto Module
- Rbacmodule Module
- Rbacrepository Module
- Rbacservice Module
- Userscontroller Module
- Confirmuploaddto Module
- Getuploadurldto Module
- Updateprofiledto Module
- Usersrepository Module
- Usersservice Module
- Usersmodule Module
- Auditlogoptions
- Allexceptionsfilter
- Jwtauthguard
- Localauthguard
- Permissionsguard
- Refreshtokenguard
- Rolesguard
- Auditloginterceptor
- Response
- Transforminterceptor
- Prismamodule Module
- Prismaservice Service
- Emailprocessor
- Notificationprocessor
- Profileimageprocessingprocessor
- Smsprocessor
- Queuesmodule Module
- Redismodule Module
- Redisservice Service
- S3module Module
- S3service Service
- Icon
- Icon
- Icon
- Icon
- Icon
- Icon
- Icon
- Icon
- Icon
- Icon
- Icon

## God Nodes (most connected - your core abstractions)
1. `Loopo Branding & Identity` - 16 edges
2. `Loopo SVG Logo` - 7 edges
3. `Flutter App Package Manifest (Loopo)` - 5 edges
4. `Docker Infrastructure (Postgres, Redis, MinIO)` - 4 edges
5. `iOS Launch Screen Configuration` - 4 edges
6. `Graphify Knowledge Graph Rules` - 2 edges
7. `MinIO S3 Object Storage` - 2 edges
8. `Flutter Lints Dev Dependency` - 2 edges
9. `Graphify Workflow Definition` - 1 edges
10. `Claude Graphify Integration Rules` - 1 edges

## Surprising Connections (you probably didn't know these)
- `Claude Graphify Integration Rules` --references--> `Graphify Knowledge Graph Rules`  [INFERRED]
  CLAUDE.md → .agents/rules/graphify.md
- `Android Launcher Icon (hdpi)` --semantically_similar_to--> `Loopo SVG Logo`  [INFERRED] [semantically similar]
  loopo-flutter/android/app/src/main/res/mipmap-hdpi/ic_launcher.png → loopo-flutter/assets/images/loopo_logo.svg
- `Android Launcher Icon (mdpi)` --semantically_similar_to--> `Loopo SVG Logo`  [INFERRED] [semantically similar]
  loopo-flutter/android/app/src/main/res/mipmap-mdpi/ic_launcher.png → loopo-flutter/assets/images/loopo_logo.svg
- `Android Launcher Icon (xhdpi)` --semantically_similar_to--> `Loopo SVG Logo`  [INFERRED] [semantically similar]
  loopo-flutter/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png → loopo-flutter/assets/images/loopo_logo.svg
- `Android Launcher Icon (xxhdpi)` --semantically_similar_to--> `Loopo SVG Logo`  [INFERRED] [semantically similar]
  loopo-flutter/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png → loopo-flutter/assets/images/loopo_logo.svg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Loopo Backend Infrastructure Services** — loopo_backend_docker_compose_postgres, loopo_backend_docker_compose_redis, loopo_backend_docker_compose_minio [EXTRACTED 1.00]
- **Flutter Multi-Platform Build System** — loopo_flutter_linux_cmakelists_linux_build, loopo_flutter_windows_cmakelists_windows_build, loopo_flutter_web_index_html_pwa_entry, loopo_flutter_pubspec_yaml_flutter_app [INFERRED 0.85]

## Communities (98 total, 92 thin omitted)

### Community 0 - "iOS & macOS Icons & Branding"
Cohesion: 0.12
Nodes (16): iOS App Icon (76x76@2x), iOS App Icon (83.5x83.5@2x), Loopo Branding & Identity, Loopo App Logo, macOS App Icon (1024x1024), macOS App Icon (128x128), macOS App Icon (16x16), macOS App Icon (256x256) (+8 more)

### Community 1 - "Android Icons & SVG Branding"
Cohesion: 0.25
Nodes (8): Android Launcher Icon (hdpi), Android Launcher Icon (mdpi), Android Launcher Icon (xhdpi), Android Launcher Icon (xxhdpi), Android Launcher Icon (xxxhdpi), Loopo SVG Logo, iOS App Icon (1024x1024@1x), iOS App Icon (76x76@1x)

### Community 2 - "Flutter Setup & Platform Configs"
Cohesion: 0.29
Nodes (7): Flutter Lint Configuration, Flutter Linux CMake Build, Cupertino Icons Dependency, Flutter App Package Manifest (Loopo), Flutter Lints Dev Dependency, Flutter Web PWA Entry Point, Flutter Windows CMake Build

### Community 3 - "Backend Infrastructure & Checklists"
Cohesion: 0.33
Nodes (6): Docker Infrastructure (Postgres, Redis, MinIO), MinIO S3 Object Storage, PostgreSQL Database Service, Redis Cache Service, Loopo NestJS Backend, Phase 2 Backend Execution Checklist

### Community 4 - "iOS Launch Screens & Configurations"
Cohesion: 0.50
Nodes (4): iOS Launch Screen Configuration, iOS Launch Image (@2x), iOS Launch Image (@3x), iOS Launch Image

### Community 5 - "Graphify Knowledge Graph Rules"
Cohesion: 0.67
Nodes (3): Graphify Knowledge Graph Rules, Graphify Workflow Definition, Claude Graphify Integration Rules

## Knowledge Gaps
- **128 isolated node(s):** `AppController`, `AppModule`, `AppService`, `AddressesModule`, `AddressesController` (+123 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **92 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Loopo Branding & Identity` connect `iOS & macOS Icons & Branding` to `iOS Launch Screens & Configurations`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `iOS Launch Screen Configuration` connect `iOS Launch Screens & Configurations` to `iOS & macOS Icons & Branding`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Are the 16 inferred relationships involving `Loopo Branding & Identity` (e.g. with `iOS Launch Screen Configuration` and `iOS App Icon (76x76@2x)`) actually correct?**
  _`Loopo Branding & Identity` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `Loopo SVG Logo` (e.g. with `Android Launcher Icon (hdpi)` and `Android Launcher Icon (mdpi)`) actually correct?**
  _`Loopo SVG Logo` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Flutter App Package Manifest (Loopo)` (e.g. with `Flutter Linux CMake Build` and `Flutter Web PWA Entry Point`) actually correct?**
  _`Flutter App Package Manifest (Loopo)` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `iOS Launch Screen Configuration` (e.g. with `Loopo Branding & Identity` and `iOS Launch Image (@2x)`) actually correct?**
  _`iOS Launch Screen Configuration` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `AppController`, `AppModule`, `AppService` to the rest of the system?**
  _128 weakly-connected nodes found - possible documentation gaps or missing edges._