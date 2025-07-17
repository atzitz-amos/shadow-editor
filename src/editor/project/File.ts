export class ProjectFile {
    name: string;
    path: string;
    type: string;

    constructor(name: string, path: string, type: string) {
        this.name = name || 'temp-file';
        this.path = path ? path + '/' + this.name : '';
        this.type = type || 'js';
    }

    read() {
        return this.path === '' ? '' : '';
    }
}