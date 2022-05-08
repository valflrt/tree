import fs from "fs/promises";
import path from "path";

/**
 * Item types
 */
export enum ItemTypes {
  Dir,
  File,
  Unknown,
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

export type ItemArray = (File | Dir | UnknownItem)[];

export class Tree {
  private _path: string;

  /**
   * Creates a file tree
   * @param path Path of the directory to scan
   */
  constructor(path: string) {
    this._path = path;
  }

  /**
   * Returns an object representation of the tree
   */
  public async toObject() {
    let loopThroughDirectories = async (
      dirPath: string
    ): Promise<ItemArray> => {
      return await Promise.all(
        (
          await fs.readdir(path.join(__dirname, dirPath), {
            withFileTypes: true,
          })
        ).map(async (v) =>
          v.isDirectory()
            ? {
                type: ItemTypes.Dir,
                path: v.name,
                items: await loopThroughDirectories(path.join(dirPath, v.name)),
              }
            : v.isFile()
            ? {
                type: ItemTypes.File,
                path: v.name,
                ext: path.extname(v.name) !== "" ? path.extname(v.name) : null,
              }
            : { type: ItemTypes.Unknown, path: v.name }
        )
      );
    };

    return {
      type: "dir",
      path: path.normalize(this._path),
      items: await loopThroughDirectories(this._path),
    };
  }

  /**
   * Returns a string representation of the tree
   * @param options Options for toString
   */
  public async toString(options?: {
    /**
     * Indentation size – Default is 2
     */
    indentSize?: number;
    /**
     * Bullet to put before file/dir names (don't forget to add a space) – Default is "- " – If `null` specified uses an empty string
     */
    bullet?: string | null;
  }) {
    let bullet = options?.bullet === null ? "" : options?.bullet ?? "- ";
    let indents = (number: number) =>
      " ".repeat(number * (options?.indentSize ?? 2));

    let loopTroughObject = (items: ItemArray, level: number = 1) => {
      return items
        .map((i): string => {
          let baseString = `${indents(level)}${bullet}${i.path}`;

          if (i.type === ItemTypes.Dir)
            return baseString.concat(
              dir.items.length !== 0 ? "\n" : "",
              loopTroughObject(i.items, level + 1)
            );
          else return baseString;
        })
        .join("\n");
    };

    let dir = await this.toObject();

    return `${bullet}${dir.path}`.concat(
      dir.items.length !== 0 ? "\n" : "",
      loopTroughObject(dir.items)
    );
  }
}
