import {LanguageBase} from "../../lang/LanguageBase";

export class ProjectFile {
    name: string;
    path: string;
    extension: string;

    language: LanguageBase | null = null;

    constructor(name: string, path: string) {
        this.name = name || 'temp-file';
        this.path = path ? path + '/' + this.name : '';
        this.extension = this.name.includes('.') ? this.name.split('.').pop() || '' : '';
    }

    read() {
        return this.path === '' ? '' : '';
    }

    getContentAsString() {
        return "";
    }

    getExtension() {
        return this.extension;
    }

    getLanguage() {
        return this.language;
    }

    setLanguage(lang: LanguageBase) {
        this.language = lang;
    }
}