

# Shadow-Editor Plugins
This file provides some more in-depth documentation on how to develop plugins
for the editor.


## Core concepts
### Workspace
The workspace is an essential component of the Shadow Editor. It is responsible for handling the project structure
as well as persisting the project. The user can create and manage workspaces directly in the UI, but it is also possible to create one programmatically:

```typescript
const workspace = new Workspace("My workspace name");
app.openProject(workspace);
```

### Document
A document is a file opened in the editor. It is represented by the `Document` class that provides numerous ways of handling
editor's content. For instance,



```typescript
const editor = ui.getMainEditor();
const doc = editor.getOpenedDocument();

doc.getTextContent(); // returns the text content of the document
doc.getTextBetween(0, 10); // returns the text between the given offsets

doc.getLineStart(3); // returns the offset of the start of the given line
doc.getLineEnd(3); // returns the offset of the end of the given line
doc.getLineCount(); // returns the number of lines in the document

doc.insertText(1, "Hello world!"); // inserts the given text at the given offset
doc.deleteAt(1, 5); // deletes the text between the given offsets
doc.replaceRange(1, 5, "Hello world!"); // replaces the text between the given offsets with the given text
``` 

Changes to the document are not immediately reflected to the editor. Indeed, for performance reasons, the editor updates
its view only on an on-demand basis. To force-update the editor, you can use the `refreshView()` method of the `Editor` class:

```typescript
editor.refreshView();
```

### Plugins
#### Creating a plugin
The ShadowApp loads plugins dynamically without needing to explicitly register them.
To create a new plugin, just add a new directory in the `src/plugins` directory. Inside, you can create a `MyPluginName.ts` file that will be the entry point of your plugin.
This file must export default a class that extends `EditorPlugin`. For instance:

```typescript
export default class MyPlugin extends EditorPlugin {
    constructor() {
        super();
    }
    
    onDisable() {
        // This method is called when the plugin is disabled. You can use it to clean up any resources used by the plugin.
    }
    
    onEnable() {
        // This method is called when the plugin is enabled. You can use it to initialize any resources needed by the plugin.
    }
    
    async onLoadAsync() {
        // This method is called when the plugin is loaded. You can use it to perform any asynchronous initialization needed by the plugin.
    }
}
```


#### Extension Points
The editor functionalities can be extended using extension points. Here is a table of some of the most common extension points:

| Extension Point | Description                                  |
|:----------------|:---------------------------------------------|
| `lang`          | Add support for a new language               |
| `action`        | Add a new action to the editor               |
| `startupPhase`  | Add a new startup phase to the loading cycle |

To register an extension points, just create a folder with the name of the extension point in your plugin directory.
Each extension point has its own format for the extension definition. 
For instance, to add support for a new language, you will need to provide a class that extends `Language` and one that implements `FileTypeHandler`:

``` 
myPlugin
 |- lang
    |- MyLanguage.ts
    |- MyFileTypeHandler.ts
```
 
More on extension points and how to use them can be found [here](#use-extension-points).

### Actions
Actions are a fundamental part of the editor. They represent any operation that can be performed in the editor, such as opening a file, saving a project, etc.
Actions are defined by creating a class in the `actions` extension point that extends `AbstractAction` and implementing the `run()` method.

```typescript
export class MoveCaretLeftAction extends AbstractAction {
    name = "MoveCaretLeft";
    description = "Move the caret to the left by one character";

    keybindContext = KeybindContextDescriptor.IN_MAIN_EDITOR;

    defaultKeybinding = {
        key: Key.ARROW_LEFT,
        ctrl: false, // explicitly forbids the use of Ctrl key in the keybinding
        alt: false, // explicitly forbids the use of Alt key in the keybinding
    };

    run(ctx: KeybindContext) {
        // Move the caret to the left by one character
    }
}
```

An action can be run from multiple scope. You can specify the scope of an action using the `keybindContext` property. For instance, the previous code only allows the action to be run when the main editor is focused. 
When ran, an action receives a special object called `KeybindContext` that contains information about the context from which the action was triggered.
For instance:

```typescript
function run(ctx: KeybindContext) {
    if (ctx.isEditorEvent()) {
        const editor = ctx.requireEditor(); // requireEditor throws if no editor is present
    } else if (ctx.isPaneEvent()) {
        const pane = ctx.requirePane(); // requirePane throws if no pane is present
    }
    
    const event = ctx.getEvent(); // getEvent returns the Mouse or Keyboard event that triggered the action, if any
}
```


