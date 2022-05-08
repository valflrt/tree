/**
 * Item types
 */
export declare enum ItemTypes {
    Dir = 0,
    File = 1,
    Unknown = 2
}
/**
 * Item type – Do not use for specific items. (`Dir | File | Unknown`)
 */
export interface Item {
    type: ItemTypes.Dir | ItemTypes.File | ItemTypes.Unknown;
    path: string;
}
/**
 * File type
 */
export interface File extends Item {
    type: ItemTypes.File;
    ext: string | null;
}
/**
 * Dir type
 */
export interface Dir extends Item {
    type: ItemTypes.Dir;
    items: ItemArray;
}
/**
 * UnknownItem type – Used when the item is neither a File nor a Dir (example: symbolic links, ...)
 */
export interface UnknownItem extends Item {
    type: ItemTypes.Unknown;
}
export declare type ItemArray = (File | Dir | UnknownItem)[];
export declare class Tree {
    private _path;
    /**
     * Creates a file tree
     * @param path Path of the directory to scan
     */
    constructor(path: string);
    /**
     * Returns an object representation of the tree
     */
    toObject(): Promise<{
        type: string;
        path: string;
        items: ItemArray;
    }>;
    /**
     * Returns a string representation of the tree
     * @param options Options for toString
     */
    toString(options?: {
        /**
         * Indentation size – Default is 2
         */
        indentSize?: number;
        /**
         * Bullet to put before file/dir names (don't forget to add a space) – Default is "- " – If `null` specified uses an empty string
         */
        bullet?: string | null;
    }): Promise<string>;
}
