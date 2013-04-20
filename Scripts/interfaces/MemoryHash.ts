interface IMemoryHash {
    hash: {};

    add(key: string, value: string): void;
    get(key: string): string;
    remove(key: string): void;
    removeIf(callBack): void;
    clear(): void;
    save(): void;
    escapeValue(value: string): string;
}