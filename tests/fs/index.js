window.onload = () => {
    document.querySelector(".x")?.addEventListener("click", () => onClick());
}

async function onClick() {
    if (!("showDirectoryPicker" in window)) {
        alert("Your browser does not support the File System Access API.");
        return;
    }
    const dir = await window.showDirectoryPicker({mode: "readwrite"});

    console.log(dir);
    if (await dir.getDirectoryHandle("MyProject")) {
        console.warn("Directory 'MyProject' already exists.");
    }
    const subdir = await dir.getDirectoryHandle("MyProject", {create: true});
}