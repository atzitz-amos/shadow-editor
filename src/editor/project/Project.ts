import {ProjectFile} from './File';

export class Project {
    name: string;
    files: ProjectFile[];

    constructor(name: string, files: ProjectFile[]) {
        this.name = name;
        this.files = files || [];
    }

    static singleFileProject(file: ProjectFile) {
        return new this('unnamed-project', [file]);
    }

    addFile(file: ProjectFile) {
        for (let f of this.files) {
            if (f.path === file.path) {
                return;
            }
        }
        this.files.push(file);
    }
}