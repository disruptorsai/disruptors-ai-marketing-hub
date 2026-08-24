


export function createPageUrl(pageName: string) {
    // If pageName already starts with '/', return as-is (handles absolute paths like /app/business-brain)
    if (pageName.startsWith('/')) {
        return pageName;
    }
    return '/' + pageName.toLowerCase().replace(/ /g, '-');
}