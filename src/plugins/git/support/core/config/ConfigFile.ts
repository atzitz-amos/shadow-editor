/**
 *
 * @author Atzitz Amos
 * @date 11/11/2026
 * @since 1.0.0
 */
export class ConfigFile {
    constructor(private readonly config: Map<string, string>) {
    }

    public static default(): ConfigFile {
        return this.fromString(`
            [core]
              repositoryformatversion = 0
              filemode = true
              bare = false
              logallrefupdates = true`);
    }

    public static fromString(configString: string): ConfigFile {
        const config = new Map<string, string>();
        let section = '';
        let subsection = '';
        const lines = configString.split('\n');
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
                const sectionMatch = trimmedLine.match(/^\[(\w+)(?: "(.*)")?]$/);
                if (sectionMatch) {
                    section = sectionMatch[1];
                    subsection = sectionMatch[2] || '';
                }
            } else if (trimmedLine.includes('=')) {
                const [key, value] = trimmedLine.split('=').map(s => s.trim());
                const fullKey = subsection ? `${section}.${subsection}.${key}` : `${section}.${key}`;
                config.set(fullKey, value);
            }
        }
        return new ConfigFile(config);
    }

    public get(key: string): string | undefined {
        return this.config.get(key);
    }

    public set(key: string, value: string): void {
        this.config.set(key, value);
    }

    public delete(key: string): void {
        this.config.delete(key);
    }

    public has(key: string): boolean {
        return this.config.has(key);
    }

    public keys(): IterableIterator<string> {
        return this.config.keys();
    }

    public values(): IterableIterator<string> {
        return this.config.values();
    }

    public toString(): string {
        let configString = '';
        let currentSection = '';
        let currentSubsection = '';
        for (const [key, value] of this.config) {
            const [section, subsection, subkey] = key.split('.');
            if (section !== currentSection || subsection !== currentSubsection) {
                if (currentSection) {
                    configString += '\n';
                }
                currentSection = section;
                currentSubsection = subsection;
                configString += `[${section}${subsection ? ` "${subsection}"` : ''}]\n`;
            }
            configString += `${subkey} = ${value}\n`;
        }
        return configString.trim();
    }
}
