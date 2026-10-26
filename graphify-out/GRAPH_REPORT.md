# Graph Report - leads-difusion-v2  (2026-10-26)

## Corpus Check
- 124 files · ~22,580 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 5, .ico 1, .css 1)

## Summary
- 680 nodes · 1864 edges · 26 communities (22 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d406d29f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Lead & Pipeline Dialogs
- App Shell & Sidebar
- Leads Table
- RichTextEditor.tsx
- Templates API
- Runtime Dependencies
- Project Docs & Conventions
- leads/schemas.ts
- Pipelines API
- ImageDropzone.tsx
- engines
- package.json
- DataTable & Select
- shadcn Config
- tsconfig
- Dev Dependencies
- Evolution API Client
- Toast UI
- Button
- Prettier Config
- npm Scripts
- ESLint Config
- Prisma Config
- PostCSS Config

## God Nodes (most connected - your core abstractions)
1. `Button()` - 46 edges
2. `react` - 39 edges
3. `errorResponse()` - 23 edges
4. `getApiErrorMessage()` - 21 edges
5. `cn` - 21 edges
6. `handleDbError()` - 19 edges
7. `DialogContent()` - 18 edges
8. `db` - 18 edges
9. `PipelineActions()` - 17 edges
10. `compilerOptions` - 17 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getLeads()`  [EXTRACTED]
  app/api/leads/route.ts → server/actions/leads/get.ts
- `PUT()` --calls--> `errorResponse()`  [EXTRACTED]
  app/api/pipelines/order/route.ts → lib/response.ts
- `GET()` --calls--> `getPipelines()`  [EXTRACTED]
  app/api/pipelines/route.ts → server/actions/pipelines/get.ts
- `GET()` --calls--> `getTemplate()`  [EXTRACTED]
  app/api/templates/[id]/route.ts → server/actions/templates/get.ts
- `PATCH()` --calls--> `errorResponse()`  [EXTRACTED]
  app/api/templates/[id]/route.ts → lib/response.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Prisma 8 contract workflow** — claude_contract_prisma, claude_contract_emit, claude_migrations_workflow, prisma_8_data_contract [INFERRED 0.85]
- **Template to WhatsApp send pipeline** — claude_templates_rich_text, claude_supabase_storage, claude_whatsapp_evolution [INFERRED 0.85]

## Communities (26 total, 4 thin omitted)

### Community 0 - "Lead & Pipeline Dialogs"
Cohesion: 0.08
Nodes (46): LeadForm(), PipelineForm(), Props, TagsCombobox(), LeadTag, SendForm(), ACCEPT, FormInput (+38 more)

### Community 1 - "App Shell & Sidebar"
Cohesion: 0.05
Nodes (51): metadata, RootLayout(), columns, helper, SEARCH_COLUMNS, AppSidebar(), DataTableFeatures, Item (+43 more)

### Community 2 - "Leads Table"
Cohesion: 0.06
Nodes (67): errorResponse(), GET(), POST(), Error(), Props, LeadsTable(), Props, Provider() (+59 more)

### Community 3 - "RichTextEditor.tsx"
Cohesion: 0.31
Nodes (5): Props, RICH_TEXT_STYLES, Props, @tiptap/react, @tiptap/starter-kit

### Community 4 - "Templates API"
Cohesion: 0.14
Nodes (27): DELETE(), PATCH(), POST(), CreateTemplateInput, createTemplateSchema, imageSchema, message, TemplateFilters (+19 more)

### Community 5 - "Runtime Dependencies"
Cohesion: 0.06
Nodes (33): dependencies, axios, @base-ui/react, class-variance-authority, cn, @dnd-kit/helpers, @dnd-kit/react, dotenv (+25 more)

### Community 6 - "Project Docs & Conventions"
Cohesion: 0.07
Nodes (30): Next.js agent feedback reporting pass, AGENTS.md Next.js agent rules, Next.js breaking changes: read node_modules/next/dist/docs, Security: auth pending, open endpoints, pnpm contract:emit (contract.json/contract.d.ts), prisma/contract.prisma source of truth, DefaultCols mixin, CLAUDE.md project guidance (+22 more)

### Community 7 - "leads/schemas.ts"
Cohesion: 0.07
Nodes (54): DELETE(), PATCH(), POST(), GET(), POST(), GET(), GET(), GET() (+46 more)

### Community 8 - "Pipelines API"
Cohesion: 0.20
Nodes (14): DELETE(), errorResponse(), handleError(), PATCH(), PUT(), position, positiveId, ReorderInput (+6 more)

### Community 9 - "ImageDropzone.tsx"
Cohesion: 0.33
Nodes (5): IMAGE_TYPES, MAX_IMAGE_SIZE, ACCEPT, Props, react-dropzone

### Community 13 - "package.json"
Cohesion: 0.08
Nodes (23): name, private, version, @dnd-kit/helpers, postcss, prettier, prettier-plugin-tailwindcss, prisma (+15 more)

### Community 14 - "DataTable & Select"
Cohesion: 0.15
Nodes (16): DataTable(), DataTableColumn, PAGE_SIZES, Props, SelectContent(), SelectItem(), SelectScrollDownButton(), SelectScrollUpButton() (+8 more)

### Community 19 - "shadcn Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 21 - "tsconfig"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 23 - "Dev Dependencies"
Cohesion: 0.13
Nodes (15): devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, prisma, @prisma/cli-engine, tailwindcss (+7 more)

### Community 24 - "Evolution API Client"
Cohesion: 0.19
Nodes (16): axios, server-only, turndown, describeError(), EvolutionPresence, getEvolutionConfig(), getTypingDuration(), normalizePhone() (+8 more)

### Community 25 - "Toast UI"
Cohesion: 0.28
Nodes (12): toast, ToastAction(), ToastClose(), ToastContent(), ToastDescription(), Toaster(), ToastIcon(), ToastList() (+4 more)

### Community 26 - "Button"
Cohesion: 0.14
Nodes (35): LeadActions(), CreatePipelineDialog(), Header(), PipelineActions(), CreateTemplateDialog(), Option, SendWhatsAppDialog(), TemplateActions() (+27 more)

### Community 29 - "Prettier Config"
Cohesion: 0.20
Nodes (9): plugins, printWidth, semi, singleQuote, tabWidth, tailwindFunctions, tailwindStylesheet, trailingComma (+1 more)

### Community 31 - "npm Scripts"
Cohesion: 0.25
Nodes (8): scripts, build, contract:emit, dev, format, format:check, lint, start

### Community 34 - "ESLint Config"
Cohesion: 0.50
Nodes (3): eslintConfig, eslint, eslint-config-next

### Community 36 - "Prisma Config"
Cohesion: 0.50
Nodes (3): dotenv, @prisma/cli-engine, @prisma/orm-postgres

## Knowledge Gaps
- **32 isolated node(s):** `ASC`, `DESC`, `@tailwindcss/postcss`, `@tiptap/pm`, `postcss` (+27 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 232 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Lead & Pipeline Dialogs` to `App Shell & Sidebar`, `Leads Table`, `package.json`, `DataTable & Select`, `Toast UI`, `Button`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **What connects `ASC`, `DESC`, `@tailwindcss/postcss` to the rest of the system?**
  _32 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Lead & Pipeline Dialogs` be split into smaller, more focused modules?**
  _Cohesion score 0.0845771144278607 - nodes in this community are weakly interconnected._
- **Why does `zod` connect `leads/schemas.ts` to `Lead & Pipeline Dialogs`, `Leads Table`, `Templates API`, `Pipelines API`, `package.json`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Should `App Shell & Sidebar` be split into smaller, more focused modules?**
  _Cohesion score 0.053998632946001365 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `Runtime Dependencies` to `package.json`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Should `Leads Table` be split into smaller, more focused modules?**
  _Cohesion score 0.05917602996254682 - nodes in this community are weakly interconnected._