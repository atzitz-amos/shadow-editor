[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

# Shadow Editor

A complete editor written from scratch in TypeScript supporting text highlighting, AST parsers, and more. 

This file aims at providing with the basic functionality
and installation features. In case you are interested by plugin development, you can check out [DOCUMENTATION.md](/DOCUMENTATION.md).  
<br>
> [!NOTE]
> This project is still under developpment and hence doesn't provide a release bundle. The only way to use this project for now is to download the source code directly.

***

## Installation

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/shadow-editor.git
   cd shadow-editor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the URL shown in the terminal)

## Basic Usage

### Launching the application
The simplest way to use Shadow Editor is through the ShadowApp class:

```typescript
import { ShadowApp } from './src/app/ShadowApp';
import { Project } from './src/core/project/Project';
import { GlobalProject } from './src/core/global/GlobalProject';
import { Editor } from './src/editor/Editor';

// Launch the application
const success = await ShadowApp.launch();

if (success) {
    // Create a project and editor
    const project = new Project("myProject");
    GlobalProject.open(project);
    
    const editor = new Editor(project);
    editor.attach(document.querySelector('.editor-container'));
}
```


### Enabling 

Plugins are disabled by default. You need to enable them explicitly using PluginManager.

```typescript
import { PluginManager } from './src/core/plugins/PluginManager';
import JSLangPlugin from './src/plugins/jsLang/JSLangPlugin';

// Enable JavaScript language support
PluginManager.getInstance().enable(JSLangPlugin.class);
```

### Listening to events
The editor is constantly broadcasting events. To listen to them, first obtain an EventBus. 

```typescript
// GlobalState contains many useful functions to access singleton instances.
import {GlobalState} from "./src/core/global/GlobalState";

const eventBus = GlobalState.getMainEventBus();
```

You can then subscribe to a specific event. For instance, to listen to any document modification:
```typescript
import {DocumentModificationEvent} from "./src/editor/core/document/events/DocumentModificationEvent";

eventBus.subscribe(this, DocumentModificationEvent.SUBSCRIBER, (ev : DocumentModificationEvent) => {/* ... */});
```

### Manipulating the document
The content of the currently opened file is stored in a `Document` class. You can get it with:
```typescript
const document = editor.getOpenedDocument();
```

This class has many useful features to edit the text content of the currently opened file, for instance:
```typescript
document.insertText(0, "Hello World\n"); // Add "Hello World\n" at offset 0
document.deleteAt(1, 3); // Delete 3 characters starting from offset 1.
document.getTotalDocumentLength(); // 9
```

These changes won't be updated to the UI however until a repaint is triggered. You can manually trigger one with:
```typescript
editor.triggerRepaint();
```

## Acknowledgments

Although the code for this project was entirely written by me, its core concepts are inspired by those of [JetBrains intellij-community](https://github.com/JetBrains/intellij-community) *(logical/visual position, ASTBuilder, Actions, etc...).*

This project also uses [JetBrains Mono](https://www.jetbrains.com/lp/mono/), licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
