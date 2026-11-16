# Shadow Editor: developer documentation

This document explains how Shadow Editor is put together and how to extend it. For an overview of the features and
instructions to run the project, see the [README](../README.md).

**Contents**

1. [Architecture](#1-architecture)
2. [Startup](#2-startup)
3. [Core services](#3-core-services)
4. [Projects and files](#4-projects-and-files)
5. [The editor](#5-the-editor)
6. [The language pipeline](#6-the-language-pipeline)
7. [Plugins](#7-plugins)
8. [Extension point reference](#8-extension-point-reference)
9. [Adding a language](#9-adding-a-language)
10. [Code analysis extensions](#10-code-analysis-extensions)
11. [Code completion](#11-code-completion)
12. [Actions, keybinds and menus](#12-actions-keybinds-and-menus)
13. [UI extensions](#13-ui-extensions)
14. [Debug tools and SynSuite](#14-debug-tools-and-synsuite)
15. [Conventions](#15-conventions)
16. [Known limitations](#16-known-limitations)

---

## 1. Architecture

The source is split into five areas. Lower layers do not depend on plugins, and plugins only talk to the rest of the
app through extension points and the public classes of the other layers.

| Area          | Role                                                                                                             |
|:--------------|:-----------------------------------------------------------------------------------------------------------------|
| `src/core`    | Infrastructure shared by everything else: lifecycle, event bus, plugins, actions, keybinds, persistence, settings, projects and file system, web workers, UI toolkit |
| `src/editor`  | The editor component: `Editor`, `Document`, carets, the view and its layers, highlighting, popups, undo, behaviors |
| `src/lang`    | The language framework: lexers, parsers, syntax trees, code analysis, completion, code generation, code style     |
| `src/app`     | The IDE shell: `ShadowApp`, the full UI layout, panes, tabs, settings dialog, search, the SynSuite engine         |
| `src/plugins` | Bundled plugins. Each directory is one plugin                                                                     |

Three ideas come up everywhere:

- **Singletons reached through `GlobalState`.** Managers and services are singletons with a static `getInstance()`.
  [`GlobalState`](../src/core/global/GlobalState.ts) groups the most useful ones behind one class
  (`GlobalState.getMainEventBus()`, `getMainEditor()`, `getCurrentProject()`, `getPaneManager()`...).
- **Events for anything that happens.** State changes are published on an [`EventBus`](#32-events). Components
  subscribe to events, they don't call each other.
- **Extension points for anything that can be added.** A feature that accepts contributions declares an
  `ExtensionPoint`. Plugins contribute by placing a class in the matching directory.

---

## 2. Startup

[`ShadowApp.launch()`](../src/app/ShadowApp.ts) is the only entry point. It creates the app, initialises
`GlobalState`, optionally shows the splash screen, then asks the [`Lifecycle`](../src/core/lifecycle/Lifecycle.ts)
to run the startup phases:

```typescript
const app = await ShadowApp.launch(true); // true: show the splash screen and progress bar
if (!app) {
    // A critical phase failed, a StartupFailedEvent was published
}
```

### 2.1 Phases

Plugins are loaded first, on their own. The remaining phases are then sorted by priority (lowest first) and run one
after the other:

| Order | Phase                       | Priority | Critical | What it does                                                        |
|:------|:----------------------------|:---------|:---------|:--------------------------------------------------------------------|
| 1     | `PluginLoadPhase`           | n/a      | yes      | Discovers every plugin and its extensions, calls `onLoadAsync()`    |
| 2     | `PersistenceRecoveryPhase`  | 20       | yes      | Opens the database and restores every persisted value               |
| 3     | `ServiceBeginPhase`         | 30       | yes      | Calls `begin()` on every `@Service`, starts the web worker services |
| 4     | `EditorComponentsInitPhase` | 50       | yes      | Registers the built-in actions                                      |
| 5     | `AppReadyPhase`             | 100      | no       | Marks the app as ready and publishes `ShadowAppLoadedEvent`         |

If a critical phase throws, startup is aborted and `launch()` resolves to `undefined`. A failure in a non-critical
phase is logged and startup continues. Each phase publishes a `StartupProgressEvent` when it starts and when it
completes, which is what drives the splash screen.

### 2.2 Adding a phase

A phase extends [`AbstractStartupPhase`](../src/core/lifecycle/startup/StartupPhase.ts):

```typescript
export class WarmUpCachePhase extends AbstractStartupPhase {
    readonly name = "Warming up caches"; // shown on the splash screen
    readonly priority = 40;              // after services, before editor components
    readonly critical = false;

    async run(): Promise<void> {
        // ...
    }
}
```

Phases can only be registered until plugin loading completes. Register yours from the plugin's `onLoadAsync()`, which
runs inside that window:

```typescript
export default class MyPlugin extends EditorPlugin {
    getId() {
        return "my.plugin";
    }

    async onLoadAsync() {
        Lifecycle.getInstance().registerPhase(new WarmUpCachePhase());
    }
}
```

`registerPhase()` returns `false` and logs a warning if registration is already locked.

### 2.3 Running code once the app is ready

The app is ready when `ShadowApp.launch()` resolves. Code that cannot await that call uses `whenAppReady()`:

```typescript
GlobalState.whenAppReady(() => {
    // Runs once startup completed, or right away if it already has
});
```

`ShadowAppLoadedEvent` is published at the same moment, and `GlobalState.isReady()` tells whether it has been.

An `Editor` can only be created once the app is ready: its constructor throws otherwise.

---

## 3. Core services

### 3.1 Services

A service is a singleton that the lifecycle starts during `ServiceBeginPhase`. Decorate the class with `@Service`,
give it a static `getInstance()` and a `begin()` method, which can be async:

```typescript
@Service
@UseLogger("WordCountService")
export class WordCountService {
    private static readonly instance = new WordCountService();
    declare private readonly logger: Logger;

    public static getInstance() {
        return this.instance;
    }

    begin() {
        GlobalState.getMainEventBus().subscribe(this, DocumentModificationEvent.SUBSCRIBER, event => {
            this.logger.debug("Document changed at offset " + event.getOffset());
        });
    }
}
```

`begin()` is the right place to subscribe to events: by then, plugins are loaded and persisted values are restored.

A service must be imported somewhere for its decorator to run. Registration is deferred to a microtask, so services
start in the order their modules were loaded.

`@DistantService` marks a service that runs in a web worker. See
[`DistantService.ts`](../src/core/threaded/service/DistantService.ts) and the `src/core/threaded` directory.

### 3.2 Events

#### Subscribing

Every event class exposes a static `SUBSCRIBER`. The first argument of `subscribe()` identifies the subscriber, and
is what you pass to unsubscribe:

```typescript
const bus = GlobalState.getMainEventBus();

bus.subscribe(this, CaretMovedEvent.SUBSCRIBER, event => {
    console.log(event.getCaret().getOffset());
});

bus.unsubscribe(this, CaretMovedEvent.SUBSCRIBER);
bus.unsubscribeAll(this);
```

A subscriber object can hold only one callback per event type on a given bus: subscribing again replaces the
previous callback.

Subscribing to a base class also delivers its subclasses, because publishing walks up the prototype chain of the
event.

#### Buses and bubbling

There is one main bus, and each `Editor` owns a sub-bus created with `createSubBus()`. An event declares how it
travels with `getBubbleDirection()`:

| Direction     | Effect                                                  |
|:--------------|:--------------------------------------------------------|
| `NO_BUBBLES`  | Delivered on the bus it was published on only           |
| `BUBBLE_UP`   | Also delivered on the parent buses, up to the main bus  |
| `BUBBLE_DOWN` | Also delivered on every child bus                       |
| `BUBBLE_BOTH` | Both                                                    |

Editor events bubble both ways, so you can listen to a single editor with `editor.getEventBus()` or to all of them
on the main bus.

#### Publishing

```typescript
bus.syncPublish(event);   // subscribers run before this call returns
bus.asyncPublish(event);  // subscribers run in a microtask
bus.publishCancellable(event); // returns false if a subscriber called event.cancel()
```

#### Defining an event

```typescript
export class BuildFinishedEvent implements EventBase {
    public static readonly SUBSCRIBER = EventSubscriber.create(this);

    constructor(private readonly success: boolean) {
    }

    getBubbleDirection(): BubbleDirection {
        return BubbleDirection.NO_BUBBLES;
    }

    wasSuccessful() {
        return this.success;
    }
}
```

Events tied to an editor extend `EditorEventBase` (or `EditorCancellableEventBase`), which adds `getEditor()`.

#### Events you are likely to need

| Event                           | Published when                                              |
|:--------------------------------|:------------------------------------------------------------|
| `ShadowAppLoadedEvent`          | Startup completed                                           |
| `ShadowUILoadedEvent`           | The UI was created                                          |
| `CurrentProjectChangedEvent`    | Another project was opened                                  |
| `ProjectFileSystemLoadedEvent`  | The file system of a project finished loading               |
| `FileCreatedEvent`, `FileDeletedEvent`, `FileModifiedEvent`, `EntryRenamedEvent`, `DirectoryCreatedEvent`, `DirectoryDeletedEvent` | The project file system changed |
| `DocumentModificationEvent`     | Text was inserted into or deleted from a document           |
| `CaretMovedEvent`               | A caret moved                                               |
| `EditorDocumentChangedEvent`    | An editor switched to another document                      |
| `MainEditorChangedEvent`        | The main editor changed                                     |
| `SynTreeChangedEvent`           | A document was re-parsed                                    |
| `SynEditorTreeChangedEvent`     | The document shown by an editor was re-parsed               |
| `SettingChangedEvent`           | The value of a setting changed                              |

### 3.3 Logging

`@UseLogger("Name")` adds a `logger` property to a class. Declare it so TypeScript knows about it:

```typescript
@UseLogger("MyClass")
export class MyClass {
    declare private readonly logger: Logger;

    doWork() {
        this.logger.info("Working");
    }
}
```

Outside a class, use `Logger.for("Name")`. A logger has `debug`, `info`, `warn` and `error` methods. The level is
set globally with `Logger.setLevel()`.

### 3.4 Scheduling

Use [`Scheduler`](../src/core/scheduler/Scheduler.ts) rather than calling timers directly:

| Method                             | Use                                                     |
|:-----------------------------------|:--------------------------------------------------------|
| `Scheduler.defer(task)`            | Run after the current call stack                        |
| `Scheduler.after(delay, task)`     | Run once after a delay                                  |
| `Scheduler.every(interval, task)`  | Run repeatedly                                          |
| `Scheduler.debounce(task, delay)`  | Run once the calls stop for `delay` milliseconds        |
| `Scheduler.throttle(task, delay)`  | Run at most once per `delay` milliseconds               |
| `Scheduler.idleTask(task)`         | Run when the browser is idle                            |
| `await Scheduler.yield()`          | Give the browser a chance to handle input and paint     |
| `await Scheduler.nextFrame()`      | Wait for the next animation frame                       |

### 3.5 Persistence

State is stored in an IndexedDB database named `shadow.db`. The simplest way to persist a value is the `@Persisted`
decorator on a **static accessor**:

```typescript
export class RecentFiles {
    @Persisted
    private static accessor lastOpened: string | null = null;

    @Persisted
    private static accessor pinned: string[] = [];
}
```

- The initialiser is the default value. The stored value replaces it during `PersistenceRecoveryPhase`.
- The storage key is `ClassName.fieldName`. Renaming either one loses the stored value.
- Assigning to the accessor schedules a write. Writes are debounced (one second) and batched.
- An array or a `Map` is wrapped so that changing it (`push`, `set`, `delete`...) also schedules a write.
- `@Persisted` can only be applied to a static accessor or to a whole class. Applied to a class, it persists every
  static field that isn't a method.

Do not read a persisted value before `PersistenceRecoveryPhase` has run: you would get the default. Inside a
service's `begin()` or later is safe.

Options cover custom classes and schema changes:

```typescript
export class WorkspaceManager {
    @Persisted({
        // How to rebuild instances of a class found in the stored data
        deserializer: d => d.use(Workspace, Workspace.deserializer),
        // Current version of the shape of the value, 1 by default
        version: 2,
        // migrations[n] turns a version n value into a version n + 1 value
        migrations: {
            1: (value, fromVersion) => upgradeWorkspaces(value)
        }
    })
    private static accessor workspaces: Map<string, Workspace> = new Map();
}
```

A class stored in a persisted value must implement `Serializable` (a `serialize()` method returning plain data) and
have a deserializer registered through the `deserializer` option.

A class with a persisted accessor gets a static `triggerPersist()` method that writes pending changes immediately
rather than waiting for the debounce. Declare it to use it:

```typescript
declare private static readonly triggerPersist: () => Promise<void>;
```

### 3.6 Settings

A setting is created once, usually as a static field, with a fluent API:

```typescript
export class MyPluginSettings {
    public static readonly TAB_WIDTH = new IntSetting("myPlugin.tabWidth")
        .setDescription("Width of a tab, in characters")
        .defaultsTo(4);

    public static readonly ACCENT = new ColorSetting("myPlugin.accentColor")
        .setDescription("Accent color of the plugin UI")
        .asCssProperty("--my-plugin-accent")
        .defaultsTo("#4d9fff");
}
```

`IntSetting`, `StringSetting`, `EnumSetting` and `ColorSetting` are available, all extending
[`SettingBase`](../src/core/settings/base/SettingBase.ts). `IntSetting` also has `setRange(min, max)`.

```typescript
const width = MyPluginSettings.TAB_WIDTH.getCurrentValue();
MyPluginSettings.TAB_WIDTH.setCurrentValue(2); // returns false if the value is not valid
MyPluginSettings.TAB_WIDTH.reset();
```

- Creating a setting registers it with the `SettingsManager`.
- `asCssProperty(name, unit?)` links the setting to a CSS custom property, which is how the visual settings of the
  editor reach the stylesheets (see [`VisualSettings.ts`](../src/editor/impl/setting/VisualSettings.ts)).
- Changing a value publishes a `SettingChangedEvent`.

To show settings in the settings dialog, contribute a [settings pane](#132-settings-panes).

### 3.7 URIs

[`EditorURI`](../src/core/uri/EditorURI.ts) identifies a resource of the editor with the syntax
`<target>://<path>#<anchor>`. Files, directories, projects and syntax documents expose a `getURI()`. To open what a
URI points to:

```typescript
await URINavigationManager.navigateAsync(file.getURI());
```

---

## 4. Projects and files

### 4.1 Projects

A [`Project`](../src/core/project/Project.ts) has a name and a file system. Its files live in the Origin Private
File System of the browser, in a directory named after the project.

```typescript
const project = new Project("myProject");
app.openProject(project);

const current = GlobalState.getCurrentProject();
```

The file system is loaded asynchronously. `project.getFS()` is not usable until `ProjectFileSystemLoadedEvent` has
been published:

```typescript
ActiveProjectHelper.onFilesystemReady(this, event => {
    // The file system can be used from here
});
```

### 4.2 File system

[`FileSystem`](../src/core/project/filesystem/FileSystem.ts) is the interface, `ProjectVFS` the implementation.
Paths given to the file system are relative to the root directory of the project.

```typescript
const fs = project.getFS();
const root = fs.getRoot();

const src = root.createDir("src");
const file = src.createFile("main.js");

await file.save("let x = 1;");
const text = await file.getTextContent();

file.rename("index.js");
file.delete();

fs.exists("src/index.js");
fs.getFile("src/index.js");
fs.recursiveGetAllFiles(); // every text file of the project
```

Entries are `ProjectDirectory`, `ProjectFile` (text) or `ProjectBinaryFile`. They all implement `FileSystemEntry`,
with `isDirectory()`, `isFile()` and `isBinaryFile()` to tell them apart.

`entry.getPath()` returns a path that starts with the name of the project (`myProject/src/index.js`), unlike the
paths the file system takes as input.

Deleting an entry is a soft delete: it is marked as deleted rather than removed from the store.

Each change publishes an event (`FileCreatedEvent`, `EntryRenamedEvent`...).

### 4.3 Workspace

The workspace of a project records its open tabs. Together with the document views (caret and scroll position per
document), this is what brings the editor back to where it was after a reload. Both are persisted with
`@Persisted`, see `WorkspaceManager` and `DocumentViewManager`.

### 4.4 Saving

Documents linked to a file are saved automatically: an edit publishes a `DocumentSaveRequestEvent`, which the
`SaveService` handles by writing the file. There is no explicit save action.

---

## 5. The editor

### 5.1 Editor, Document and DocumentView

- A [`Document`](../src/editor/core/document/Document.ts) holds text, its lines, its tokens and its undo stack. It
  knows nothing about display.
- A `DocumentView` is a document plus a caret offset and a scroll position.
- An [`Editor`](../src/editor/Editor.ts) displays one `DocumentView` at a time and can switch to another with
  `changeDocument()`.

```typescript
const editor = GlobalState.getMainEditor(); // or ui.getMainEditor()
const document = editor.getOpenedDocument();
const file = editor.getOpenedFile();        // null if the document is not linked to a file
const language = editor.getCurrentLanguage();
```

`Editor.setReadonly(true)` makes an editor read-only.

### 5.2 Reading a document

All positions are **offsets**: a number of characters from the start of the document.

```typescript
document.getTextContent();              // the whole text
document.getTextBetween(0, 10);         // the text between two offsets
document.getCharAt(4);
document.getTotalDocumentLength();

document.getLineCount();
document.getLineStart(offset);          // offset of the start of the line containing `offset`
document.getLineEnd(offset);            // offset of the end of the line containing `offset`
document.getLineAt(offset);             // LineData of the line containing `offset`
document.getLineData(3);                // LineData of line 3

document.getTokenAt(offset);            // the token at an offset
document.getLanguage();
```

> [!NOTE]
> `getLineStart()`, `getLineEnd()` and `getLineAt()` take an offset, not a line number. `getLineData()` and
> `getLineLength()` take a line number.

### 5.3 Coordinates

| Type              | Meaning                                                                |
|:------------------|:-----------------------------------------------------------------------|
| `Offset`          | Index of a character in the document                                   |
| `LogicalPosition` | Row and column in the text                                             |
| `VisualPosition`  | Row and column as displayed, which can differ from the logical position |
| `XYPoint`         | Pixels                                                                 |

The editor converts between them: `offsetToLogical()`, `logicalToOffset()`, `offsetToVisual()`, `visualToXY()`,
`xyToNearestLogical()`...

A [`TextRange`](../src/core/text/range/TextRange.ts) is a pair of offsets, with `start` and `end`.

### 5.4 Modifying a document

The low-level methods are `insertText(offset, text)`, `deleteAt(offset, n)` and `replaceRange(range, text)`. Each
one updates the lines, re-lexes and re-parses what changed, publishes a `DocumentModificationEvent` and records an
undo entry. `replaceRange()` is a deletion followed by an insertion, so it publishes two events.

Calling them directly leaves the caret where it was and creates one undo step per call. Wrap your changes in
`DocumentModificationUtils.modifyWithCaret()` instead:

```typescript
const caret = editor.getPrimaryCaret();

DocumentModificationUtils.modifyWithCaret(document, caret, "insertHeader", () => {
    document.insertText(0, "// Generated file\n");
    document.deleteAt(40, 5);
});

editor.repaintView();
```

- Everything in the callback becomes a single undo step, named by the third argument. Pass `null` to skip undo
  grouping.
- The caret is tracked through the changes: it moves with the text around it, and ends up after text inserted at
  its position.

To follow a region of text through edits yourself, use a tracked range:

```typescript
const range = document.createTracked(start, end);
// After edits, range.getStart() and range.getEnd() still delimit the same text
range.invalidate(); // when you no longer need it
```

### 5.5 Carets and selection

```typescript
const caret = editor.getPrimaryCaret();

caret.getOffset();
caret.getLogical(); // row and column
caret.moveToOffset(120, CaretMovementFlags.JUMP);

const selection = caret.getSelectionModel();
if (selection.isSelectionActive) {
    selection.getStart();
    selection.getEnd();
}
```

### 5.6 Behaviors and modes

Typing, deleting and pressing Enter go through the `BehaviorManager` of the editor, a chain of handlers that each
either handle the input (`BehaviorHandlingMode.HANDLED`) or pass it on (`FORWARD`). [Smart actions](#103-smart-typing)
plug into this chain. A mode, such as read-only or live template editing, temporarily replaces how input is handled.

---

## 6. The language pipeline

When a document changes, lexing, highlighting and parsing happen synchronously, before `DocumentModificationEvent`
reaches the main bus. Subscribers of that event can therefore rely on the tokens and the tree being up to date.
Code analysis follows, debounced per editor, with a delay that grows with the size of the document:

```
edit
 └─ lexer             re-lexes the affected range and updates the token cache
     └─ highlighter   colours the tokens
         └─ parser    re-parses, reusing the parts of the tree that did not change
             └─ DocumentModificationEvent
                 ⋮  (debounced)
                 └─ code analysis   reference collection, inspections, annotators
```

| Stage         | Class                                                 | Notes                                                                     |
|:--------------|:------------------------------------------------------|:--------------------------------------------------------------------------|
| Lexing        | `IncrementalLexer`                                    | Produces `Token`s with a `TokenType`, stored in the `TokenCache` of the document |
| Highlighting  | `HighlighterBase`                                     | Maps each token to a `TextAttributeKey` (colour and font style)           |
| Parsing       | `IParser` driving an `ASTBuilder`                     | Builds a `SynTree` of `SynNode`s. Checkpoints allow resuming from the middle of the document |
| Analysis      | `CodeAnalysisPass`es, run by `CodeAnalysisManager`    | Every pass contributes visitors, all run in one traversal of the tree     |

The parsed form of a document is a [`SynDocument`](../src/lang/syntax/api/document/SynDocument.ts):

```typescript
const synDocument = SynDocumentManager.getOpenedSynDocument(editor);
const tree = synDocument.getTree();
const problems = synDocument.getProblemsHolder().getProblems();
```

Parsing is bounded in time by a `KillSignal`: a parse that runs for more than one second is aborted with a
`KillSignalTriggeredError` and the tree is not updated. This protects the UI from a parser stuck in a loop.
[index.html](../index.html) currently turns the limit off by calling `disableTimebomb()`; `enableTimebomb()`, also
available from the browser console, turns it back on.

To parse text that isn't in an open document, for example to analyse generated code, use `QuickParseUtils.quickParse()`.

---

## 7. Plugins

### 7.1 Creating a plugin

A plugin is a directory in `src/plugins` containing a TypeScript file that default-exports a class extending
[`EditorPlugin`](../src/core/plugins/loader/Plugin.ts):

```
src/plugins/
 └─ myPlugin/
     ├─ MyPlugin.ts        ← the plugin class
     ├─ actions/           ← extensions, one directory per extension point
     ├─ inspections/
     └─ styles/            ← stylesheets
```

```typescript
import {EditorPlugin} from "../../core/plugins/loader/Plugin";

export default class MyPlugin extends EditorPlugin {
    getId(): string {
        return "my.plugin"; // must be unique
    }

    onEnable(): void {
        // The plugin was enabled
    }

    onDisable(): void {
        // The plugin was disabled, release what onEnable acquired
    }

    async onLoadAsync(): Promise<void> {
        // Optional. Called once during startup, whether or not the plugin gets enabled
    }
}
```

There is nothing to register: the loader finds plugins with a glob over `src/plugins/*/*.ts`. The name of the
directory is the name of the plugin.

### 7.2 Enabling a plugin

Plugins are loaded disabled. Enable them after launching the app:

```typescript
import MyPlugin from "./src/plugins/myPlugin/MyPlugin";

app.enable(MyPlugin.class);
GlobalState.getPluginManager().disable(MyPlugin.class);
```

Enabling a plugin calls `onEnable()`, loads its stylesheets and contributes its extensions. Disabling it does the
reverse.

### 7.3 Contributing extensions

An extension is a **default-exported class** placed in a subdirectory of the plugin. The loader works out which
extension point it targets from its path:

| File                                           | Extension point       |
|:-----------------------------------------------|:----------------------|
| `myPlugin/inspections/UnusedLabel.ts`          | `inspections`         |
| `myPlugin/lang/MyLang.ts`                      | `lang`                |
| `myPlugin/lang/definitions/MyParserDef.ts`     | `lang.definitions`    |
| `myPlugin/completion/provider/MyProvider.ts`   | `completion.provider` |

Nested directories are joined with a dot. In the reference below, `lang/definitions` and `lang.definitions` are the
same extension point.

Each of those classes is instantiated **once, with no arguments**, when plugins are loaded during startup. When the
plugin is enabled, the instance is offered to every extension point registered under that name. An extension point
only accepts instances of its base class, so the class you extend decides what you contribute. This is why a single
`smart` directory can hold insert, delete, enter and highlight actions.

A few consequences:

- A file that doesn't default-export a class is ignored, so helpers can live next to extensions as named exports.
- A default export in a directory that matches no extension point is ignored. This is how the bundled language
  plugins keep their lexers under `lang/lexer` and their syntax nodes under `lang/syntax`.
- A default export in a directory that does match is always instantiated with `new`, even if it turns out not to be
  an extension. Keep constructors free of required arguments and side effects.
- The `styles` directory is reserved for stylesheets.

To place an extension somewhere else, name the extension point explicitly with `@Extension`:

```typescript
// src/plugins/jsLang/intents/numeric/JsConvertNumberToDecimalIntent.ts
@Extension("intents")
export default class JsConvertNumberToDecimalIntent extends IntentBase {
    // ...
}
```

The decorator takes precedence over the path. It is not inherited: a subclass of a decorated class needs its own.

### 7.4 Stylesheets

Every `.css` file directly inside the `styles` directory of a plugin is added to the page when the plugin is enabled
and removed when it is disabled.

### 7.5 Declaring an extension point

Any class can accept contributions by declaring an extension point with a name and a base class:

```typescript
export class LinterRegistry {
    private static readonly linterEP = new ExtensionPoint("linters", LinterBase)
        .onContribute((plugin, linter) => console.log("Added by", plugin.getId()))
        .onWithdraw(plugin => console.log("Removed by", plugin.getId()));

    public static getLinters(): LinterBase[] {
        return this.linterEP.getAll();
    }
}
```

`getAll()` returns the contributions of every enabled plugin. `withDefaultContributors(...)` adds built-in
contributions that don't belong to any plugin. The module declaring the point must be imported before plugins are
loaded, otherwise the name isn't known yet and contributions to it are skipped.

---

## 8. Extension point reference

| Extension point       | Base class to extend                                                                      | Purpose                                                                         |
|:----------------------|:------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------|
| `lang`                | `LanguageBase`, `FileTypeProvider`                                                        | Declare a language, and which files it applies to                               |
| `lang/definitions`    | `LanguageParserDefinition`, `LanguageCodeStyleDefinition`                                 | Attach a parser, or a formatter, to a language                                  |
| `annotators`          | `AnnotatorBase`                                                                           | Semantic highlighting based on the syntax tree                                  |
| `inspections`         | `InspectionBase`                                                                          | Report problems, optionally with quick fixes                                    |
| `intents`             | `IntentBase`                                                                              | Context actions offered at the caret (`Alt+Enter`)                              |
| `smart`               | `SmartInlineInsertAction`, `SmartInlineDeleteAction`, `SmartInlineEnterAction`, `SmartInlineHighlight` | React to typing, deleting, Enter and caret movement                 |
| `tokenhover`          | `TokenHoverAction`                                                                        | React to the mouse hovering a token                                             |
| `completion`          | `CompletionTriggerHandler`                                                                | Decide when and where completion opens for a language                           |
| `completion/provider` | `CodeCompletionProvider`                                                                  | Supply completion items                                                         |
| `codeAnalysis/pass`   | `CodeAnalysisPassProvider`                                                                | Add a pass to the code analysis traversal                                       |
| `actions`             | `AbstractAction`                                                                          | Add an action, with an optional keybinding                                      |
| `panes`               | `AbstractPane`                                                                            | Add a pane to the IDE shell                                                     |
| `settings/pane`       | `SettingsPaneBase`                                                                        | Add a page to the settings dialog                                               |
| `projectFiles`        | `FileSystemEntryType`                                                                     | Add an entry type to the "New..." dialog of the project tree                    |

Bundled examples:

| Extension point       | Example                                                                                                           |
|:----------------------|:------------------------------------------------------------------------------------------------------------------|
| `lang`                | [JsLang](../src/plugins/jsLang/lang/JsLang.ts), [JsFileTypeProvider](../src/plugins/jsLang/lang/JsFileTypeProvider.ts) |
| `lang/definitions`    | [JsParserDefinition](../src/plugins/jsLang/lang/definitions/JsParserDefinition.ts), [JsCodeStyleDefinition](../src/plugins/jsLang/lang/definitions/JsCodeStyleDefinition.ts) |
| `annotators`          | [JsFunctionCallsAnnotator](../src/plugins/jsLang/annotators/JsFunctionCallsAnnotator.ts)                          |
| `inspections`         | [EmptyStatementInspection](../src/plugins/jsLang/inspections/EmptyStatementInspection.ts)                         |
| `intents`             | [JsSwapOperandsLeftIntent](../src/plugins/jsLang/intents/JsSwapOperandsLeftIntent.ts)                             |
| `smart`               | [JsSmartAutoCloseInsertAction](../src/plugins/jsLang/smart/JsSmartAutoCloseInsertAction.ts)                       |
| `tokenhover`          | [JsShowOperatorPrecedenceOnHover](../src/plugins/jsLang/tokenhover/JsShowOperatorPrecedenceOnHover.ts)            |
| `completion`          | [JsCompletionTriggerHandler](../src/plugins/jsLang/completion/JsCompletionTriggerHandler.ts)                      |
| `completion/provider` | [JsKeywordProvider](../src/plugins/jsLang/completion/provider/JsKeywordProvider.ts)                               |
| `codeAnalysis/pass`   | [RiscVControlFlowPassProvider](../src/plugins/riscvAssemblyLang/codeAnalysis/pass/RiscVControlFlowPassProvider.ts) |
| `actions`             | [JsCommentOutCodeAction](../src/plugins/jsLang/actions/JsCommentOutCodeAction.ts)                                 |
| `panes`               | [DebugToolsPane](../src/plugins/debugTools/panes/DebugToolsPane.ts)                                               |

---

## 9. Adding a language

The [`riscvAssemblyLang`](../src/plugins/riscvAssemblyLang) plugin is the smallest complete example and a good one
to copy. A language needs the following pieces:

```
myLang/
 ├─ MyLangPlugin.ts
 └─ lang/
     ├─ MyLang.ts                    ← extension: the language
     ├─ MyFileTypeProvider.ts        ← extension: which files use it
     ├─ definitions/
     │   └─ MyParserDefinition.ts    ← extension: the parser
     ├─ lexer/                       ← not extension points, used by the classes above
     ├─ highlighter/
     ├─ parser/
     └─ syntax/
```

### 9.1 The language

```typescript
export default class MyLang extends LanguageBase {
    public static INSTANCE: MyLang;

    private constructor() {
        super();
        MyLang.INSTANCE = this;
    }

    getKey() {
        return "my-lang";
    }

    getDisplayName() {
        return "My Language";
    }

    getDefaultExtension() {
        return "my";
    }

    createLexer(): ILexer {
        return new MyIncrLexer();
    }

    createHighlighter(): HighlighterBase {
        return new MyHighlighter();
    }

    getIcon(): Icon | null {
        return FaIcon.solid("code");
    }
}
```

The loader creates the single instance of the language, so the constructor stores it in `INSTANCE` for the rest of
the plugin to refer to. `INSTANCE` is only set once plugins have been loaded: don't read it from a static
initialiser.

### 9.2 File types

```typescript
export default class MyFileTypeProvider extends FileTypeProvider {
    getSupportLevel(file: ProjectFile): SupportLevel {
        return file.getExtension() === "my" ? SupportLevel.SUPPORTS : SupportLevel.DOESNT;
    }

    getLanguageForFile(file: ProjectFile): LanguageBase | null {
        return MyLang.INSTANCE;
    }
}
```

When several providers claim a file, the highest `SupportLevel` wins: `DOESNT`, `BASIC`, `SUPPORTS`, `OVERRIDE`.

### 9.3 Token types

Token types are declared as static fields of a class implementing `LexicalGrammar`:

```typescript
export class MyLexicalGrammar implements LexicalGrammar {
    public static readonly EOL = LexicalBuilder.makeSkippable("EOL");
    public static readonly WHITESPACE = LexicalBuilder.makeSkippable("WHITESPACE");
    public static readonly COMMENT = LexicalBuilder.makeComment("COMMENT");

    public static readonly KEYWORD = LexicalBuilder.makeIdentifier("KEYWORD");
    public static readonly IDENTIFIER = LexicalBuilder.makeIdentifier("IDENTIFIER");
    public static readonly NUMBER = LexicalBuilder.make("NUMBER", /\d+/);
    public static readonly LPAREN = LexicalBuilder.make("LPAREN");
}
```

`makeSkippable` is for tokens the parser should not see, such as whitespace and line ends. `makeComment` and
`makeIdentifier` flag a type so that `token.isCommentToken()` and identifier checks work without knowing the
language. The optional regular expression is used by lexers driven by the grammar.

### 9.4 The lexer

Extend `IncrementalLexer` and implement `tokenize()`, which reads one token from the input:

```typescript
export default class MyIncrLexer extends IncrementalLexer {
    tokenize(input: Source): Token {
        if (input.isEmpty()) {
            return new Token(TokenType.EOF, "", new TextRange(input.getOffset(), input.getOffset()));
        }

        const start = input.getOffset();
        let ch = input.seek()!;

        if (ch === " " || ch === "\t") {
            let value = "";
            while (ch === " " || ch === "\t") {
                value += input.consume()!;
                ch = input.seek()!;
            }
            return new Token(MyLexicalGrammar.WHITESPACE, value, input.getRange(start));
        }

        // ... the other token types
    }
}
```

The base class handles incremental re-lexing: after an edit, it calls `tokenize()` from the whitespace preceding the
edit up to a whitespace boundary following it, and replaces only those tokens in the cache.

### 9.5 The highlighter

```typescript
export class MyHighlighter extends HighlighterBase {
    public static readonly KEYWORD_KEY = TextAttributeKey.of(MyColorScheme.KEYWORD_COLOR);
    public static readonly COMMENT_KEY = TextAttributeKey.of(MyColorScheme.COMMENT_COLOR, TextFontStyleKeys.ITALIC);

    performHighlighting(holder: HighlightHolder, token: Token): void {
        if (token.getType() === MyLexicalGrammar.KEYWORD) {
            holder.highlightRange(token.getRange(), MyHighlighter.KEYWORD_KEY);
        } else if (token.isCommentToken()) {
            holder.highlightRange(token.getRange(), MyHighlighter.COMMENT_KEY);
        }
    }
}
```

A language with only these pieces already gets syntax highlighting. The rest is needed for anything based on the
syntax tree.

### 9.6 The parser

A parser is a recursive descent parser written against an
[`ASTBuilder`](../src/lang/syntax/builder/parser/builder/ASTBuilder.ts). You place a marker, consume tokens, then
close the marker with the type of node it produces:

```typescript
export class MyParser implements IParser {
    constructor(private readonly builder: ASTBuilder) {
    }

    parse(): void {
        const marker = this.builder.mark();
        while (!this.builder.done()) {
            this.parseStatement();
        }
        marker.done(MyGrammar.Program);
    }

    private parseStatement() {
        const marker = this.builder.mark();
        this.builder.expect(MyLexicalGrammar.KEYWORD, "print").failWith("Expected 'print'");
        this.builder.expect(MyLexicalGrammar.NUMBER).failWith("Expected a number");
        marker.done(MyGrammar.PrintStatement);
    }
}
```

| Method                           | Use                                                       |
|:---------------------------------|:----------------------------------------------------------|
| `done()`                         | Whether every token was consumed                          |
| `seek()`, `lookAhead(n)`         | Look at the next tokens without consuming them            |
| `isNext(type, value?)`           | Test the next token                                       |
| `advance()`                      | Consume the next token                                    |
| `consumeIf(type, value?)`        | Consume the next token if it matches                      |
| `expect(type, value?).failWith(message)` | Consume the next token, or report an error        |
| `mark()`                         | Start a node. Returns a `Marker`                          |
| `marker.done(type)`              | Close a node                                              |
| `marker.rollback()`              | Give up on a node and go back to where it started         |
| `popAndError(message)`, `errorOn(token, message)` | Report a syntax error                    |

Node types are declared with `ASTGrammar.create()`, which links a name to the class of the node:

```typescript
export class MyGrammar {
    public static readonly Program = ASTGrammar.create("Program", MyProgram.builder());
    public static readonly PrintStatement = ASTGrammar.create("PrintStatement", MyPrintStatement.builder());
}
```

Look at the classes under [`riscvAssemblyLang/lang/syntax`](../src/plugins/riscvAssemblyLang/lang/syntax) for how
node classes are written, and at the visitor next to them: inspections and annotators are written as visitors over
your node classes.

### 9.7 The parser definition

```typescript
export default class MyParserDefinition extends LanguageParserDefinition {
    getLanguage(): LanguageBase {
        return MyLang.INSTANCE;
    }

    createParser(builder: ASTBuilder): IParser {
        return new MyParser(builder);
    }

    createPrinter(): SynPrinter {
        return new MyPrinter();
    }
}
```

A `LanguageCodeStyleDefinition`, also under `lang/definitions`, attaches a `CodeStyleManager` (formatting and
spacing rules) to the language. See [`JsCodeStyleDefinition`](../src/plugins/jsLang/lang/definitions/JsCodeStyleDefinition.ts).

---

## 10. Code analysis extensions

Inspections, annotators and custom passes all work the same way: they return a visitor, and the
`CodeAnalysisManager` runs every visitor in a single traversal of the tree each time the document is re-parsed.

### 10.1 Inspections

An inspection reports problems on nodes, optionally with quick fixes:

```typescript
export default class EmptyStatementInspection extends InspectionBase {
    getId(): string {
        return "javascript.inspections.emptyStatement";
    }

    getSeverity(): InspectionSeverity {
        return InspectionSeverity.WARNING;
    }

    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.INSTANCE];
    }

    buildVisitor(holder: ProblemsHolder): SynNodeVisitor {
        const inspection = this;
        return new class extends JsSynVisitor {
            visitEmptyStatement(element: JsEmptyStatement) {
                holder.registerProblem(inspection, "Empty statement", element, [new class extends QuickFix {
                    getId() {
                        return "javascript.quickFix.removeEmptyStatement";
                    }

                    getDescription() {
                        return "Remove empty statement";
                    }

                    applyFix(node: JsEmptyStatement, synModTree: SynModificationTree): void {
                        synModTree.removeNode(node);
                    }
                }]);
            }
        };
    }
}
```

- Severities are `CONSIDERATION`, `WEAK_WARNING`, `WARNING` and `ERROR`.
- `registerProblem()` takes an optional range as its last argument, to underline only a part of the node.
- A quick fix doesn't edit the document. It records changes on a modification tree, which are then applied together
  as one undoable edit.

### 10.2 Annotators

An annotator adds highlighting that the lexer cannot decide on its own, such as telling a function call from a
variable:

```typescript
export default class JsFunctionCallsAnnotator extends AnnotatorBase {
    getId(): string {
        return "javascript.annotators.functionCalls";
    }

    getApplicableLanguages(): LanguageBase[] {
        return [JsLang.INSTANCE];
    }

    buildVisitor(holder: HighlightHolder): SynNodeVisitor {
        return new class extends JsSynVisitor {
            visitCallExpr(element: JsCallExpr) {
                if (element.getCallee() instanceof JsIdentifier) {
                    holder.highlightRange(element.getCallee().getTextRange(), JsHighlighter.TEXT_FUNCTION_KEY);
                }
            }
        };
    }
}
```

### 10.3 Smart typing

The `smart` extension point accepts four kinds of classes. Each has `getApplicableLanguages()` and an optional
`getPriority()` (higher runs first).

| Base class                | Runs when               | Implement                                              |
|:--------------------------|:------------------------|:-------------------------------------------------------|
| `SmartInlineInsertAction` | A character is typed    | `isApplicable(ctx)`, `invoke(ctx)`                     |
| `SmartInlineDeleteAction` | A character is deleted  | `isApplicable(ctx)`, `invoke(ctx)`                     |
| `SmartInlineEnterAction`  | Enter is pressed        | `isApplicable(ctx)`, `invoke(ctx)`                     |
| `SmartInlineHighlight`    | The caret moves         | `isApplicable(ctx)`, `apply(ctx, holder)`              |

`invoke()` returns `BehaviorHandlingMode.HANDLED` to stop there, or `FORWARD` to let the next handler, and
ultimately the default behavior, run.

For the common cases, extend the ready-made classes instead: `SmartAutoCloseInsertAction` (insert the closing
bracket or quote), `SmartAutoCloseDeleteAction` (delete the pair together) and `SmartSkipSecondCloseableCharAction`
(type over an existing closing character). With `SmartAutoCloseInsertAction` you only decide whether to close:

```typescript
export default class MySmartAutoCloseInsertAction extends SmartAutoCloseInsertAction {
    constructor() {
        super({"(": ")", "[": "]", "{": "}"}); // see JsSmartActionsUtils.AUTOCLOSEABLES
    }

    getApplicableLanguages(): LanguageBase[] {
        return [MyLang.INSTANCE];
    }

    shouldAutoClose(ctx: EditorCharTypedContext, leadingChar: string, char: string, trailingChar: string): boolean {
        return !ctx.getTokenAtCaret()?.isCommentToken();
    }
}
```

### 10.4 Token hover

A `TokenHoverAction` runs when the mouse rests on a token:

```typescript
export default class ShowDocOnHover extends TokenHoverAction {
    getApplicableLanguages() {
        return [MyLang.INSTANCE];
    }

    isApplicable(ctx: EditorBehaviorContext, token: Token): boolean {
        return token.getType() === MyLexicalGrammar.KEYWORD;
    }

    getDelay(): number {
        return 500; // milliseconds
    }

    execute(ctx: EditorBehaviorContext, tree: SynTree | null, token: Token): void {
        // Show something
    }

    cleanup(ctx: EditorBehaviorContext): void {
        // Remove what execute() showed
    }
}
```

Override `requiresShift()`, `requiresControl()` or `requiresAlt()` to only react while a modifier is held.

### 10.5 Intents

An intent is a context action offered in the `Alt+Enter` popup when the caret is on a node of one of its target
types:

```typescript
export default class JsConvertNumberToDecimalIntent extends IntentBase {
    getId() {
        return "js.intent.convertNumberToDecimal";
    }

    getDescription() {
        return "Convert number to decimal";
    }

    getApplicableLanguage(): LanguageBase[] {
        return [JsLang.INSTANCE];
    }

    getTargetTypes(): Class<SynNode>[] {
        return [JsNumberLiteral];
    }

    isApplicable(caret: Caret, node: JsNumberLiteral): boolean {
        return node.getNumberFormat() !== NumberFormat.DECIMAL;
    }

    async execute(caret: Caret, node: JsNumberLiteral, synModTree: SynModTree): Promise<void> {
        synModTree.replaceNodeWithText(node, node.getNumericValue().toString());
    }
}
```

Like quick fixes, intents record their changes on a modification tree. To rebuild a node rather than replace its
text, use the templates of the language (`JsBinaryExprTemplate`, `JsFunctionTemplate`...) with
`synModTree.replaceNode(node, template)`.

> [!NOTE]
> Two modification APIs coexist: quick fixes receive a `SynModificationTree` (`src/lang/syntax/writer/template`),
> intents receive a `SynModTree` (`src/lang/codeGen/modification`).

### 10.6 Custom analysis passes

To compute something else during the traversal, contribute a `CodeAnalysisPassProvider`. It creates a
`CodeAnalysisPass` per analysis run:

```typescript
export default class MyPassProvider extends CodeAnalysisPassProvider<MyResults> {
    createPass(document: SynDocument): CodeAnalysisPass<MyResults> {
        return new MyPass(document);
    }

    getPriority(): number {
        return 0; // lower runs first, 10 by default
    }
}
```

A pass implements `collectVisitors()` (the visitors to run), `getHolder()` (its results), `processResults(editor)`
(apply the results to an editor) and `runOnlyOnVisibleNodes()`.

Use a priority below the default when other passes depend on your results. The RISC-V plugin does this to build a
control-flow graph that its inspections then read.

---

## 11. Code completion

Completion for a language needs two extensions.

A **`CompletionTriggerHandler`** (`completion` extension point) answers questions about the text: is completion
allowed at this offset (not in a comment or a string), which characters are part of an identifier, which characters
open completion on their own (`.` for member access), and what the prefix before the caret is. See
[`JsCompletionTriggerHandler`](../src/plugins/jsLang/completion/JsCompletionTriggerHandler.ts).

A **`CodeCompletionProvider`** (`completion/provider` extension point) supplies items:

```typescript
export default class MyKeywordProvider extends CodeCompletionProvider {
    getApplicableLanguages(): LanguageBase[] {
        return [MyLang.INSTANCE];
    }

    isApplicable(parent: SynParentElement, placeholder: SynTokenNode, text: string): boolean {
        return true;
    }

    getCompletionItems(parent: SynParentElement, placeholder: SynTokenNode, text: string): CodeCompletionItem[] {
        return [
            new SimplePostfixCodeCompletion("print", " "),
            new SimplePostfixCodeCompletion("if", " ($CARET)"),
            new SimpleMultilineCodeCompletion("loop", " {\n$INDENT$CARET\n}")
        ];
    }
}
```

- Return every item that makes sense at that position, not only the ones matching `text`. The session filters them
  as the user types, and brings them back when characters are deleted.
- `parent` and `placeholder` may belong to a re-parsed copy of the tree. Resolve scope by walking up from `parent`,
  not from the tree of the document.
- In the text inserted after the keyword, `$CARET` is where the caret ends up and `$INDENT` is one level of
  indentation.
- `.specificity(n)` ranks an item above less specific ones.

---

## 12. Actions, keybinds and menus

### 12.1 Actions

An action is anything the user can trigger: from a key, a mouse click or a menu. It extends
[`AbstractAction`](../src/core/actions/AbstractAction.ts):

```typescript
export default class DuplicateLineAction extends AbstractAction {
    getName(): string {
        return "Duplicate Line";
    }

    getDescription(): string {
        return "Duplicate the line the caret is on";
    }

    getDefaultKeybinding(): Keybind | null {
        return {key: Key.D, ctrl: true, shift: false, alt: false};
    }

    run(ctx: KeybindContext): void {
        const editor = ctx.requireEditor();
        const document = editor.getOpenedDocument();
        const caret = editor.getPrimaryCaret();

        DocumentModificationUtils.modifyWithCaret(document, caret, "duplicateLine", () => {
            const start = document.getLineStart(caret.getOffset());
            const end = document.getLineEnd(caret.getOffset());
            document.insertText(end, "\n" + document.getTextBetween(start, end));
        });
        editor.repaintView();
    }
}
```

In a plugin, put the file in the `actions` directory. `run()` can be async.

`LanguageSpecificAction` is a variant that only runs in editors of given languages: implement
`getApplicableLanguages()` and `doRun()` instead of `run()`.

### 12.2 Keybinds

A `Keybind` names a key and the state of each modifier:

```typescript
{key: Key.L, ctrl: true, alt: true, shift: false}
```

| Value of a modifier     | Meaning                                    |
|:------------------------|:-------------------------------------------|
| `true`                  | Must be held                               |
| `false`                 | Must not be held                           |
| `null` or left out      | Doesn't matter                             |

`Shortcut.ctrl(Key.S)`, `Shortcut.ctrlShift(Key.F)`, `Shortcut.alt(Key.ENTER)` and similar helpers build the common
combinations. `Key` also contains mouse buttons (`Key.LeftDoubleClick`...), so an action can be bound to a click.

Bindings can be changed at runtime through the `KeybindManager`, with `setKeybind(actionId, keybind)` and
`resetKeybind(actionId)`.

Several actions can share a key. When it is pressed, the candidates whose modifiers match are tried in this order,
until one of them runs:

1. Bindings set by the user, before default bindings
2. Lowest `priority` first (a `Keybind` has an optional `priority`, 0 by default)
3. Most specific first: a binding that pins a modifier comes before one that leaves it open

A candidate is skipped when its required data is missing, or when it calls `ctx.abort()`.

### 12.3 Where an action applies

`getKeybindContext()` says where the action is available. It defaults to `IN_MAIN_EDITOR`.

| Descriptor       | Available when the event comes from            |
|:-----------------|:-----------------------------------------------|
| `IN_TEXT_AREA`   | The text area of an editor                     |
| `IN_MAIN_EDITOR` | An editor                                      |
| `IN_PANE`        | A pane                                         |
| `IN_MAIN_WINDOW` | An editor or a pane                            |

An action that doesn't depend on an editor overrides both methods, since the default required keys include one:

```typescript
getKeybindContext() {
    return KeybindContextDescriptor.IN_MAIN_WINDOW;
}

getRequiredKeys(): DataKey<unknown>[] {
    return [];
}
```

> [!NOTE]
> The descriptor only matters through the data keys it implies. An editor sends its own key and mouse events to the
> `KeybindManager`; key presses anywhere else are sent by the UI shell, with the context of the focused element.
> An action bound to a key therefore runs wherever its required data is available: `Shift+F6` renames the entry
> of the focused row of the project tree, and does nothing in an editor.

### 12.4 Contextual data

An action shouldn't go looking for the editor or the selected file. It receives a `KeybindContext` carrying typed
data, read with [`CommonDataKeys`](../src/core/keybinds/context/data/CommonDataKeys.ts):

```typescript
export class OpenFileAction extends AbstractAction {
    // ...

    getRequiredKeys() {
        return [CommonDataKeys.PROJECT_FILE];
    }

    run(ctx: KeybindContext): void {
        const file = ctx.require(CommonDataKeys.PROJECT_FILE);
        // ...
    }
}
```

| Key                   | Value                                              |
|:----------------------|:---------------------------------------------------|
| `EDITOR`              | The focused editor                                 |
| `TEXT_AREA`           | `true` when the event comes from a text area       |
| `PANE`                | The focused pane                                   |
| `PROJECT_FILE`        | The file of the editor, or the selected file       |
| `PROJECT_FILES`       | The selected files                                 |
| `PROJECT_ENTRY`       | The selected file or directory                     |
| `FILES_TREE`          | The file tree the event comes from                 |
| `OPENED_EDITOR_TAB`   | The active tab. Available everywhere               |
| `SELECTED_EDITOR_TAB` | The tab the event comes from, such as the one that was right-clicked |

- `getRequiredKeys()` declares what the action needs. Keybinds and menus use it to decide whether the action is
  applicable: an action whose keys are missing is not run, and the key press goes to the next candidate.
- `ctx.require(key)` returns the value, and aborts the action as not applicable if it is missing. `ctx.get(key)`
  returns `undefined` instead, and `ctx.has(key)` tests for it.
- `ctx.requireEditor()` and `ctx.requirePane()` are shorthands for the two most common keys.
- `ctx.getEvent()` is the keyboard or mouse event that triggered the action.
- `ctx.abort()` stops the action and lets another one handle the key.

To define your own key, create it once and keep the reference, since keys are compared by identity:

```typescript
export const MyDataKeys = {
    SELECTED_BRANCH: DataKey.create<Branch>("myPlugin:selected-branch")
};
```

The data comes from the UI. A component makes values available to everything inside its element with
`ContextResolver.register()`:

```typescript
ContextResolver.register(this.branchListElement, {
    provide: key => {
        if (key === MyDataKeys.SELECTED_BRANCH) return this.getSelectedBranch();
        return undefined;
    }
});
```

When an event occurs, the context is assembled from the providers registered on the target element and on its
ancestors, closest first, so a value provided by an element shadows the one of an ancestor.
`ContextResolver.registerGlobal()` registers a provider that is consulted after those, for values that
don't depend on where the event comes from.

### 12.5 Action groups

An `ActionGroup` is an ordered list of actions that a menu can display. A group has a unique id and is usually a
singleton:

```typescript
export class BranchMenuActionGroup extends ActionGroup {
    public static readonly INSTANCE = new BranchMenuActionGroup();

    getId(): string {
        return "myPlugin.branchMenu";
    }
}
```

An action joins groups from its `addToGroups()` method, which is called once after the action is registered:

```typescript
addToGroups() {
    BranchMenuActionGroup.INSTANCE.addAction(this, {after: someOtherActionId});
}
```

The placement is optional and can be `before` or `after` the id of another action, an `index`, or a `priority`. This
lets a plugin add actions to a group defined elsewhere, such as the context menu of the project tree
(`ProjectFilesContextMenuActionGroup`).

### 12.6 Menus

Menus accept actions directly. The context is captured when the menu opens, so the action receives the file or
editor the menu was opened on, even if the focus changes before an item is clicked:

```typescript
ContextMenuElement.open(event.clientX, event.clientY, menu => {
    menu.addAction("Open", new OpenFileAction());
    menu.setGroup(BranchMenuActionGroup.INSTANCE);
}, event);
```

- `addAction(label, action, icon?, shortcut?)` adds one item. `action` is an `AbstractAction` or a callback
  receiving the same context:
  ```typescript
  menu.addAction("Delete", ctx => {
      ctx?.require(CommonDataKeys.PROJECT_FILE).delete();
  });
  ```
- `setGroup(group)` adds every action of a group, labelled with its name and default keybinding. It also accepts
  the id of the group.
- Items whose action is not applicable in the captured context are left out when the menu opens.

A component that has a `contextMenu` option, such as the file tree, takes the same callback:

```typescript
filesTree.setContextMenu(menu => {
    menu.setGroup(ProjectFilesContextMenuActionGroup.INSTANCE);
});
```

---

## 13. UI extensions

### 13.1 Panes

A pane is a panel of the IDE shell, opened from the rail on the left. It extends
[`AbstractPane`](../src/app/core/panes/pane/AbstractPane.ts) and creates its component on demand:

```typescript
export default class OutlinePane extends AbstractPane {
    getId(): string {
        return "outline-pane";
    }

    getTitle(): string {
        return "Outline";
    }

    getIcon(): Icon {
        return FaIcon.solid("list");
    }

    protected getPreferredDockPosition(): PaneDockPosition {
        return PaneDockPosition.LEFT;
    }

    protected createComponent(): UIPaneComponent {
        return new OutlinePaneComponent(this);
    }

    protected onShow() {
        GlobalState.getMainEventBus().subscribe(this, SynEditorTreeChangedEvent.SUBSCRIBER, e => {
            (this.getComponent() as OutlinePaneComponent).update(e.getSynDocument());
        });
    }

    protected onHide() {
        GlobalState.getMainEventBus().unsubscribe(this, SynEditorTreeChangedEvent.SUBSCRIBER);
    }
}
```

Dock positions are `LEFT`, `RIGHT_TOP`, `RIGHT_BOTTOM`, `BOTTOM` and `FLOATING`. Subscribe in `onShow()` and
unsubscribe in `onHide()`, so that a hidden pane does no work.

The component extends `UIPaneComponent` and builds its DOM in `draw()`:

```typescript
export class OutlinePaneComponent extends UIPaneComponent {
    public draw(): void {
        this.setInnerHTML("<div class='outline'></div>");
    }
}
```

Panes placed in the `panes` directory of a plugin are added when the plugin is enabled. Panes can also be managed
by hand through the `PaneManager`:

```typescript
GlobalState.getPaneManager().open(new OutlinePane());
```

### 13.2 Settings panes

A page of the settings dialog extends `SettingsPaneBase`:

```typescript
export default class MyPluginSettingsPane extends SettingsPaneBase {
    getName(): string {
        return "My Plugin";
    }

    getParentGroup(): SettingsPaneGroup | null {
        return null; // or a group, to nest the page
    }

    getPaneContent(): UIComponent {
        return new MyPluginSettingsComponent();
    }
}
```

In a plugin, the file goes in `settings/pane/`.

### 13.3 Project file types

A `FileSystemEntryType` adds a choice to the "New..." dialog of the project tree:

```typescript
export default class MakefileEntryType extends FileSystemEntryType {
    getDescription(): string {
        return "Makefile";
    }

    getIcon(): Icon | null {
        return FaIcon.solid("hammer");
    }

    createEntry(parent: ProjectDirectory, name: string): FileSystemEntry {
        return parent.createFile("Makefile");
    }
}
```

In a plugin, the file goes in `projectFiles/`.

### 13.4 Dialogs

[`IdeDialogUtilsCore`](../src/core/ui/lib/dialog/utils/IdeDialogUtilsCore.ts) covers the common needs:

```typescript
const name = await IdeDialogUtilsCore.askString("Enter new name", "untitled"); // null if cancelled
const confirmed = await IdeDialogUtilsCore.confirm("Delete file", "This cannot be undone.");

IdeDialogUtilsCore.showDialog(new MyDialog());
IdeDialogUtilsCore.isOpen(MyDialog);
IdeDialogUtilsCore.closeDialog(MyDialog);
```

### 13.5 The UI toolkit

The shell is built from [`UIComponent`](../src/core/ui/engine/components/UIComponent.ts)s, each wrapping one DOM
element and holding child components. `src/core/ui/lib` contains the reusable ones: buttons, checkboxes, dropdowns,
lists, trees, tabs, menus, dialogs, charts and a side-by-side diff view. Most of them can also be written as HTML
tags, see [13.6](#136-custom-elements). Icons are created with `FaIcon`
(`FaIcon.solid("code")`, `FaIcon.brands("fa-js").colored("#f7df1e")`).

Components react to UI changes through hooks rather than through the event bus:

```typescript
@UIHooks.react(PaneHooks.PANE_SHOW)
protected onAnyPaneShown(pane: IPane): void {
    // ...
}
```

`@UIHooks.react` cannot be used on `#private` methods.

### 13.6 Custom elements

The toolkit defines ten HTML elements, so that markup given to `setInnerHTML`, or written in a dialog template, can
contain controls without building components by hand:

```typescript
buttons.innerHTML = `<ide-button secondary>Cancel</ide-button><ide-button primary>Confirm</ide-button>`;
```

| Element                 | Content                                         | State and events                                          | Component           |
|-------------------------|-------------------------------------------------|-----------------------------------------------------------|---------------------|
| `<ide-button>`          | Its label                                       | `click`                                                   | `IdeButton`         |
| `<ide-checkbox>`        | Its label                                       | `checked`, `input`, `change`                              | `IdeCheckbox`       |
| `<ide-dropdown>`        | `<ide-option>` children                         | `value`, `input`, `change`                                | `IdeDropdown`       |
| `<ide-menu-button>`     | None, the menu comes from the `builder` property | `primaryaction`                                          | `IdeMenuButton`     |
| `<ide-tabs>`            | `<ide-tab>` children                            | `selected`, `change`                                      | `TabPane`           |
| `<ide-searchable-list>` | `<ide-list-item>` children, or `items`          | `value`, `change`, `confirm`                              | `IdeSearchableList` |
| `<ide-code>`            | The code to highlight                           |                                                           | `HighlightedFragment` |
| `<ide-shortcut>`        | None                                            |                                                           | `ShortcutBadge`     |
| `<ide-diff>`            | None, the texts are properties                  | `getResult()`                                             | `IdeSideBySideDiff` |
| `<ide-donut-chart>`     | `<ide-donut-segment>` children, or `segments`   |                                                           | `IdeDonutChart`     |

The component column names the class to use from code instead. Each component is what the element shows, so both
behave the same.

#### Registration and styles

`ShadowUIFactory` calls `CustomElementsLoader.ensureLoaded()` before it builds the UI. The loader imports every file
found directly in a folder of `src/core/ui/lib` (`src/core/ui/lib/<folder>/<file>.ts`), and each file defines its
element with `CustomElementsRegistry.register(name, constructor)`, which skips a name that is already defined, as
happens on a hot reload. Nothing is defined in a worker, which has no DOM.

The styles are in the `lib-*.css` file of each folder, imported by
[`src/core/ui/lib/lib.css`](../src/core/ui/lib/lib.css).

To add an element, put its file directly in a folder of `src/core/ui/lib`, as a file nested deeper is not imported by
the loader, and add its stylesheet to `lib.css`. An element written into the page before its definition is loaded
stays a plain unknown element until then, and gets its behavior once the definition is registered.

#### Two kinds of elements

**Controls** (`<ide-button>`, `<ide-checkbox>`, `<ide-dropdown>`) extend
[`IdeControlElement`](../src/core/ui/lib/elements/IdeControlElement.ts). The element is itself the control: there is
no native `<button>` or `<input>` inside, so its class list, style and content can be changed like those of any
element. They behave like native controls:

- They can be focused with Tab, and set their ARIA `role`.
- `disabled` (attribute or property) removes them from the tab order. It also stops clicks before any listener sees
  them, and makes `:disabled` match in CSS.
- They are form-associated: inside a `<form>`, a control with a `name` submits its value.

**Component hosts** (all the other elements but `<ide-shortcut>`) extend
[`UIComponentElement`](../src/core/ui/lib/elements/UIComponentElement.ts). The element creates its component from its
attributes when it is first connected, and appends the component's element as its own child. `getComponent()`
returns that component, or null before the element is connected.

When an attribute it observes changes, the host disposes of the component and creates a new one. Several attribute
changes made in a row cause a single rebuild, at the next microtask. A rebuild loses whatever state is not held in
an attribute, such as the unchanged lines a user expanded in a diff.

In attributes, a number that does not parse is ignored. A boolean attribute is true when it is present, unless its
value is `"false"`.

An `icon` attribute is the name of a Font Awesome icon, with or without its `fa-` prefix, such as `icon="play"` or
`icon="fa-file-code"`. It is a solid icon, unless the name is in the short list of brands known to `FaIcon.auto()`,
such as `github`.

#### `<ide-button>`

```html
<ide-button primary>Run</ide-button>
<ide-button secondary disabled><i class="fa-solid fa-trash"></i>Delete</ide-button>
```

- **Variant:** `primary` is the accent button. `secondary`, the default, is the bordered button. `ghost` removes
  the background and border.
- **Keyboard:** Enter and Space click the button.
- **From code:** [`IdeButton`](../src/core/ui/lib/buttons/IdeButton.ts) creates a native `button.ide-btn` with the
  same look: `new IdeButton("Run", UIVariant.PRIMARY)`. It has `onClick()`, `setText()`, `enable()` and `disable()`.

#### `<ide-checkbox>`

```html
<ide-checkbox checked name="wrap">Wrap long lines</ide-checkbox>
```

- **Attributes:** `checked`, `indeterminate` (the "some selected" state), `disabled`, and `name`. `value` is what
  the form submits, and defaults to `"on"`.
- **Toggling:** clicking or pressing Space toggles it and clears `indeterminate`. It then dispatches `input` and
  `change`, which see the new `checked`, as with a native checkbox.
- **From code:** [`IdeCheckbox`](../src/core/ui/lib/checkbox/IdeCheckbox.ts) is a `ValuedComponent<boolean>`. It is
  created with `new IdeCheckbox(parent, "Wrap long lines", true)`. It has `isChecked()`, `setChecked()`,
  `setIndeterminate()`, `setEnabled()`, `setLabel()` and `setOnValueChanged(callback)`.

#### `<ide-dropdown>`

```html
<ide-dropdown value="lf" name="lineEnding">
    <ide-option value="lf">LF</ide-option>
    <ide-option value="crlf" icon="microsoft">CRLF</ide-option>
    <ide-option disabled>CR</ide-option>
</ide-dropdown>
```

- **Value:** the selected option is the one whose value matches `value`. An option without a `value` uses its text.
  Without a `value` attribute, the first option is selected, unless `placeholder` is set: then nothing is, and the
  placeholder is shown.
- **Children:** options can be added, removed or edited at any time, and the field is updated.
- **Opening:** a click, Enter, Space or Alt+Down opens a `PopupMenu` listing the enabled options, with the selected
  one checked.
- **Keyboard:** while the list is closed, Up, Down, Home and End change the selection directly, as with a native
  `<select>`.
- **Events:** picking another option sets `value` and dispatches `input` and `change`.
- **Properties:** `value`, `options`, `selectedOption` and `selectedIndex`. The methods are `open()`, `close()`,
  `toggle()` and `isOpen()`.
- **Styling:** the field is drawn in a shadow root, so that the children only hold the options. It is styled through
  `::part(label)`, `::part(placeholder)` and `::part(arrow)`.
- **From code:** [`IdeDropdown`](../src/core/ui/lib/dropdown/IdeDropdown.ts) is a `ValuedComponent<string>`. It is
  created with `new IdeDropdown(parent, [{value: "lf", label: "LF"}, {value: "crlf", icon: "microsoft"}], "lf")`. It
  has `setItems()`, `setValue()`, `setPlaceholder()` and `setEnabled()`. `getValue()` is null while nothing is
  selected.

#### `<ide-menu-button>`

```html
<ide-menu-button label="Run" icon="play" variant="primary" split></ide-menu-button>
```

```typescript
const button = element.querySelector("ide-menu-button")!;
button.builder = menu => menu
    .addAction("Run tests", () => runTests(), FaIcon.solid("vial"))
    .addSeparator()
    .addAction("Run with coverage", () => runTests({coverage: true}));
button.addEventListener("primaryaction", () => runTests());
```

The button opens a `PopupMenu` anchored to it. The `builder` property fills the menu every time it opens, so the
menu always reflects the current state. If the builder adds nothing, the menu does not open.

- **Attributes:** `label`, `icon`, `tooltip`, `size` (`small` or `normal`) and `disabled`.
- **`variant`:** `ghost`, the default, is a borderless toolbar button. The others are `primary` and `secondary`.
- **`placement`:** where the menu opens, `bottom-end` by default. The others are `bottom-start`, `top-start` and
  `top-end`.
- **`menu-class`:** a CSS class added to the menu.
- **`indicator="false"`:** hides the small corner triangle.
- **`split`:** the button is split in two. The main part dispatches `primaryaction`, and only the arrow opens the
  menu.
- **Keyboard:** Down opens the menu, unless the button is split.
- **Methods:** `open()` and `close()`. Changing `disabled` does not rebuild the button.
- **From code:** [`IdeMenuButton`](../src/core/ui/lib/buttons/IdeMenuButton.ts) is created with
  `new IdeMenuButton(builder, options)`. Its options mirror the attributes, `primaryAction` is a callback instead of
  an event, and a `context` callback gives the `KeybindContext` passed to the actions of the menu.

#### `<ide-tabs>`

```html
<ide-tabs selected="tree">
    <ide-tab tab-id="tree" label="Tree">...</ide-tab>
    <ide-tab tab-id="tokens" label="Tokens" tooltip="Output of the lexer" tooltip-position="top">...</ide-tab>
</ide-tabs>
```

- **Tabs:** each `<ide-tab>` child becomes a tab, and is moved into the content area of the `TabPane`.
- **Ids:** a tab without `tab-id` is identified by its position.
- **Appending:** a tab appended later is added to the pane.
- **Selection:** setting `selected` (attribute or property) selects a tab. Selecting a tab, by a click or from code,
  updates `selected` and dispatches `change` with the id as `detail.id`.
- **From code:** [`TabPane`](../src/core/ui/lib/tabs/TabPane.ts) has `addTab(id, label, component, tooltip?,
  tooltipPosition?)`, `selectTab()`, `getSelectedTabId()` and `onTabSelected(listener)`.

#### `<ide-searchable-list>`

```html
<ide-searchable-list>
    <ide-list-item icon="file-code">main.js</ide-list-item>
    <ide-list-item icon="file-lines">README.md</ide-list-item>
</ide-searchable-list>
```

The list shows items with an icon, sorted by their text. The selection moves with Up and Down, wrapping around at
both ends, or by clicking an item. Enter or a double click confirms it.

- **Items:** setting the `items` property to an array of `Describable`s (`getDescription()` and `getIcon()`)
  replaces the children. Setting it back to null uses the children again.
- **Children:** while the children are used, adding, removing or editing an `<ide-list-item>` rebuilds the list.
- **Events:** `change` when the selection changes, and `confirm` when an item is chosen, both with the item as
  `detail.value`. For a child, that item carries the `<ide-list-item>` element as `detail.value.element`.
- **Value:** the `value` property is the selected item, and `focus()` focuses the list.
- **Searching:** the list does not filter itself. The caller replaces the items when the search text changes, and can
  forward the keys of its own input to `IdeList.onKeyDown()`.
- **From code:** [`IdeSearchableList`](../src/core/ui/lib/lists/IdeSearchableList.ts) is created with
  `new IdeSearchableList(parent, elements)`, and its contents are replaced with `setElements()`. Its base class,
  `IdeList`, takes any element type, with a function creating the component of each element.

#### `<ide-code>`

```html
<ide-code lang="javascript">const answer = 42;</ide-code>
```

- **Highlighting:** the text content is highlighted with the lexer and highlighter of the language whose key is
  `lang`. Language keys are `javascript`, `html` and `riscv-assembly`. Any other `lang` shows plain text.
- **Changing the text:** set `textContent`, the `code` property, or edit the children in any way: the element
  highlights it again right after. The `code` property returns the text without the highlighting markup.
- **From code:** [`HighlightedFragment`](../src/core/ui/lib/highlight/HighlightedFragment.ts) is created with
  `new HighlightedFragment(parent, text, language)`. It adds `addHighlight(range, key)` and
  `setCustomHighlighter()`.

#### `<ide-shortcut>`

```typescript
container.innerHTML = `
    <ide-shortcut keys="Ctrl+Shift+F"></ide-shortcut>
    <ide-shortcut action="${CloseEditorTabAction.getID()}"></ide-shortcut>`;
```

The element is the badge of a keybind. The keybind is given either directly by `keys`, or by `action` as the
keybind of the action with that id, including the user's rebinding. Action ids are generated, so read them from
`getID()` instead of writing them out.

- **Parsing `keys`:** modifiers and a key are separated by `+`, in any case. The key is a `Key` value (`ArrowUp`), a
  `Key` name (`ARROW_UP`) or the label the badge shows (`↑`, `Space`). Text that cannot be parsed is shown as is.
- **Updates:** the badge is computed when the element is connected and when one of its attributes changes. It does
  not follow a keybind changed later.
- **From code:** `ShortcutBadge.format(keybind)` and `ShortcutBadge.parse(text)` convert between a `Keybind` and its
  text.

#### `<ide-diff>`

```html
<ide-diff old-title="Saved" new-title="Current" context="2" ignore-whitespace></ide-diff>
```

```typescript
const diff = element.querySelector("ide-diff")!;
diff.setTexts(savedText, currentText);
diff.getResult()?.getInsertedCount();
```

The two texts are shown side by side, line by line. Deleted and inserted lines are highlighted, and a deletion
followed by an insertion is aligned as a modified block.

- **Scrolling:** both sides scroll vertically together, and horizontally on their own.
- **Header:** the header shows the titles, and the counts of inserted and deleted lines.
- **Texts:** `oldText` and `newText` (properties, or the `old-text` and `new-text` attributes) hold the texts.
  `setTexts()` sets both and computes the diff once.
- **Folding:** long runs of unchanged lines are folded into a row the user can expand, keeping `context` lines (3 by
  default) around each change. `fold-unchanged="false"` disables folding.
- **`ignore-whitespace`:** lines are compared without their leading and trailing whitespace.
- **Result:** `getResult()` returns the `DiffResult` shown. It has `getChanges()`, `isIdentical()`,
  `getInsertedCount()` and `getDeletedCount()`.
- **From code:** [`IdeSideBySideDiff`](../src/core/ui/lib/diff/IdeSideBySideDiff.ts) is created with
  `new IdeSideBySideDiff(oldText, newText, options)`.

#### `<ide-donut-chart>`

```html
<ide-donut-chart caption="tests">
    <ide-donut-segment label="Passed" value="12" color="#7fae8a"></ide-donut-segment>
    <ide-donut-segment label="Failed" value="3" color="#c76b6b"></ide-donut-segment>
</ide-donut-chart>
```

The chart is a ring with one segment per value, clockwise from the top. The total is shown in its center, and a
legend lists the label, value and share of each segment. Hovering a segment or its legend row fades the others, and
shows its value in the center.

- **Attributes:** `size` is the diameter (150 px by default), `thickness` the ring width (16), and `gap` the space
  between segments (2). `caption` is the text under the total (`"total"` by default), and `legend="false"` hides the
  legend.
- **Segments:** setting the `segments` property to an array of `{label, value, color}` takes precedence over the
  children. Editing the children updates the chart.
- **`format`:** this property, a function of a number, formats the values.
- **From code:** [`IdeDonutChart`](../src/core/ui/lib/charts/IdeDonutChart.ts) is created with
  `new IdeDonutChart(segments, options)` and updated with `setSegments()`.

---

## 14. Debug tools and SynSuite

The `debugTools` plugin is meant for people working on the editor or on a language plugin.

- **AST viewer pane.** Shows the syntax tree of the open document, re-rendered on every parse, and highlights the
  node under the caret. The fastest way to check what your parser produces.
- **Debug tools popup** (`Ctrl+Alt+,`). Holds an AST tab and a code style tab.
- **SynSuite** (`Ctrl+Shift+Alt+T`). A snapshot test suite for parsers and inspections, stored in the browser. A
  test records a source text along with the tree and the problems it produced, and fails when a later run produces
  something else. `Ctrl+Alt+T` creates a test from the current document. Tests are organised in groups, and each
  run reports timings.

[index.html](../index.html) also exposes a number of classes and helpers on `window` for use in the browser console,
such as `GlobalState`, `editor`, `getSynDocument()` and `highlight(start, end)`.

---

## 15. Conventions

- **Decorators are standard (TC39) decorators**, compiled by SWC with `decoratorVersion: "2022-03"`.
  `experimentalDecorators` is off. Decorators receive `(value, context)`, and persisted fields must be declared with
  the `accessor` keyword.
- **Global types** are declared in [`src/env.d.ts`](../src/env.d.ts) and need no import: `Offset` and `int`
  (numbers), `Class<T>` (a possibly abstract class), `Constructor<T>` (a class that can be instantiated).
- **Singletons** expose a static `getInstance()`, or a static `INSTANCE` for extensions created by the plugin loader.
- **Extensions are default exports**, everything else is a named export.
- **File headers** carry `@author`, `@date` and `@since`.
- **Ids** are dotted and prefixed by their owner: `javascript.inspections.emptyStatement`, `js.intent.swapOperandsLeft`.
- Import paths are case-sensitive on Linux and in production builds on some hosts. Match the case of the file name
  exactly.

---

## 16. Known limitations

- `ShadowUIFactory.singleEditorUI()` is not implemented. Only the full IDE UI can be created.
- `src/plugins/git` contains the beginning of Git support (reading a repository) but has no plugin class yet, so it
  is not loaded.
- `WorkspaceRestorePhase` exists but is empty and is not part of the startup sequence.
- The settings dialog has an "Appearance" page with no content yet.
- There is no automated test runner. Parser and inspection regressions are caught with SynSuite, and `tests/`
  contains manual test pages.
