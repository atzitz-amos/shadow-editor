[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

# Shadow Editor

A complete editor written from scratch in TypeScript supporting text highlighting, AST parsers, and more.

This file aims at providing with the basic functionality
and installation features. In case you are interested by plugin development, you can check
out [DOCUMENTATION.md](/DOCUMENTATION.md).  
<br>
> [!NOTE]
> This project is still under developpment and hence doesn't provide a release bundle. The only way to use this project
> for now is to download the source code directly.

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

The ShadowEditor can be launched in two distinct modes: FullUI and EditorOnly. The first one provides with a complete
user interface, while the second one only renders the editor component, allowing you to integrate it into your own
application.
In any case, the `ShadowApp` class must be running as it manages the lifecycle of the application. Here is how to launch
the app in both modes:

```typescript
import {ShadowUIFactory} from "./src/app/ui/ShadowUIFactory";
import {ShadowApp} from "./src/app/ShadowApp";

const app = await ShadowApp.launch(true); // true if you want to show the progress bar as the app is loading, false otherwise

if (!app) {
    console.error("Failed to launch the Shadow Editor application.");
} else {
    console.log("Shadow Editor application launched successfully.");

    // FullUI mode
    ui = await ShadowUIFactory.fullAppUI();

    // EditorOnly mode
    ui = await ShadowUIFactory.singleEditorUI();
}
```

### Plugins

The Shadow Editor is extremely configurable by using Plugins. Plugins can be used for a wide variety of purposes, such
as adding support for new languages, providing with new actions, or even modifying the user interface. You can check
out [DOCUMENTATION.md](/DOCUMENTATION.md) for more details about plugin development. However, here
are some examples of how to use plugins in your application:

### Enabling

Plugins are automatically loaded from the `src.plugins` directory. However, plugins are always loaded in disabled mode.
To enable a plugin, you have to use explicitly tell the app to do so. For instance, to enable javascript support:

```typescript
import JSLangPlugin from "./src/plugins/jsLang/JSLangPlugin"; // exported default


app.enable(JSLangPlugin.class); // The `class` property of a plugin is a special variable holding a reference to the plugin class itself, which is singleton. 
```

### Events

The editor is constantly broadcasting events about its state. You can listen to these events by using
the `EventBus` class. For instance, to listen to document changes:

```typescript
const bus = GlobalState.getMainEventBus(); // GlobalState is a special class that holds references
                                           // to the most important components of the app, such as the main event bus

bus.subscribe(this, DocumentModificationEvent.SUBSCRIBER, (event: DocumentModificationEvent) => {
    // Do something when the document is modified
});

```

## Acknowledgments

Although the code for this project was entirely written by me, some of its core concepts are inspired by those
of [JetBrains intellij-community](https://github.com/JetBrains/intellij-community) *(logical/visual position,
ASTBuilder, Actions, etc...).*

This project also uses [JetBrains Mono](https://www.jetbrains.com/lp/mono/), licensed under
the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0).
