export const LogStyles = {
    level: {
        debug: "color: #ababab; font-weight: bold;",
        info: "color: #69b8ff; font-weight: bold;",
        warn: "color: #FF9800; font-weight: bold;",
        error: "color: #F44336; font-weight: bold;"
    },
    source: {
        debug: "color: #9a8a9c; font-weight: normal;",
        info: "color: #e29ee8; font-weight: normal;",
        warn: "color: #e29ee8; font-weight: normal;",
        error: "color: #e29ee8; font-weight: normal;"
    },
    message: {
        debug: "color: #888; display: inline;",
        info: "color: inherit; display: inline;",
        warn: "color: #ffeca8;",
        error: "color: inherit; display: inline;"
    },
    timestamp: {
        debug: "color: #555; font-size: 0.85em; margin-left: 8px; font-family: monospace;",
        info: "color: #666; font-size: 0.85em; margin-left: 8px; font-family: monospace;",
        warn: "color: #666; font-size: 0.85em; margin-left: 8px; font-family: monospace;",
        error: "color: #666; font-size: 0.85em; margin-left: 8px; font-family: monospace;"
    }
} as const;

