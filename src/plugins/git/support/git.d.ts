interface GitInitConfig {
    initialBranch?: string;
}

interface GitAddConfig {
    dryRun?: boolean;
    force?: boolean;
    ignoreRemovals?: boolean;
    ignoreUpdates?: boolean;
    ignoreAdditions?: boolean;
}