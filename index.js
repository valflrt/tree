"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tree = exports.ItemTypes = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
/**
 * Item types
 */
var ItemTypes;
(function (ItemTypes) {
    ItemTypes[ItemTypes["Dir"] = 0] = "Dir";
    ItemTypes[ItemTypes["File"] = 1] = "File";
    ItemTypes[ItemTypes["Unknown"] = 2] = "Unknown";
})(ItemTypes = exports.ItemTypes || (exports.ItemTypes = {}));
class Tree {
    /**
     * Creates a file tree
     * @param path Path of the directory to scan
     */
    constructor(path) {
        this._path = path;
    }
    /**
     * Returns an object representation of the tree
     */
    async toObject() {
        let loopThroughDirectories = async (dirPath) => {
            return await Promise.all((await promises_1.default.readdir(path_1.default.join(__dirname, dirPath), {
                withFileTypes: true,
            })).map(async (v) => v.isDirectory()
                ? {
                    type: ItemTypes.Dir,
                    path: v.name,
                    items: await loopThroughDirectories(path_1.default.join(dirPath, v.name)),
                }
                : v.isFile()
                    ? {
                        type: ItemTypes.File,
                        path: v.name,
                        ext: path_1.default.extname(v.name) !== "" ? path_1.default.extname(v.name) : null,
                    }
                    : { type: ItemTypes.Unknown, path: v.name }));
        };
        return {
            type: "dir",
            path: path_1.default.normalize(this._path),
            items: await loopThroughDirectories(this._path),
        };
    }
    /**
     * Returns a string representation of the tree
     * @param options Options for toString
     */
    async toString(options) {
        let bullet = options?.bullet === null ? "" : options?.bullet ?? "- ";
        let indents = (number) => " ".repeat(number * (options?.indentSize ?? 2));
        let loopTroughObject = (items, level = 1) => {
            return items
                .map((i) => {
                let baseString = `${indents(level)}${bullet}${i.path}`;
                if (i.type === ItemTypes.Dir)
                    return baseString.concat(dir.items.length !== 0 ? "\n" : "", loopTroughObject(i.items, level + 1));
                else
                    return baseString;
            })
                .join("\n");
        };
        let dir = await this.toObject();
        return `${bullet}${dir.path}`.concat(dir.items.length !== 0 ? "\n" : "", loopTroughObject(dir.items));
    }
}
exports.Tree = Tree;
