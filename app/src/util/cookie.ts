export const readCookieValue = (name: string): string | undefined => {
    const segments = document.cookie.split(";");
    for (const segment of segments) {
        const trimmed = segment.trim();
        if (!trimmed) {
            continue;
        }
        const eq = trimmed.indexOf("=");
        if (eq === -1) {
            continue;
        }
        const key = trimmed.slice(0, eq).trim();
        if (key !== name) {
            continue;
        }
        let value = trimmed.slice(eq + 1).trim();
        try {
            value = decodeURIComponent(value);
        } catch {
            // 保持原始值
        }
        return value;
    }
    return undefined;
};
