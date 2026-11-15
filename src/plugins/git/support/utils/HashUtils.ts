import {unzlibSync, zlibSync} from "fflate";
import {ObjectType} from "../data/objects/ObjectType";

export interface HashedObject {
    /** 40-character lowercase hex hash, used for file paths and refs. */
    hash: string;
    /** 20 raw hash bytes, used inside tree entries. */
    rawHash: Uint8Array;
    /** zlib-compressed "<type> <size>\0<content>", as stored in .git/objects. */
    compressed: Uint8Array;
}

export interface ParsedObject {
    type: ObjectType;
    content: Uint8Array;
}

const OBJECT_TYPES: ReadonlySet<string> = new Set(["blob", "tree", "commit", "tag"]);
const HASH_HEX_LENGTH = 40;
const HASH_BYTE_LENGTH = 20;

export class HashUtils {
    // ---------------------------------------------------------------------
    // Text <-> bytes
    // ---------------------------------------------------------------------

    public static createByteArray(msg: string): Uint8Array {
        return new TextEncoder().encode(msg);
    }

    public static fromByteArray(array: Uint8Array): string {
        return new TextDecoder().decode(array);
    }

    /** Accept either a Uint8Array or a Blob and return bytes. */
    public static async toBytes(content: Uint8Array | Blob): Promise<Uint8Array> {
        return content instanceof Blob
            ? new Uint8Array(await content.arrayBuffer())
            : content;
    }

    /** Join several byte arrays into one. */
    public static concat(...arrays: Uint8Array[]): Uint8Array {
        const total = arrays.reduce((sum, a) => sum + a.length, 0);
        const result = new Uint8Array(total);
        let offset = 0;
        for (const a of arrays) {
            result.set(a, offset);
            offset += a.length;
        }
        return result;
    }

    // ---------------------------------------------------------------------
    // Hex
    // ---------------------------------------------------------------------

    /** Raw bytes -> lowercase hex string. */
    public static toHex(bytes: Uint8Array): string {
        return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    }

    /** Hex string -> raw bytes. Throws on invalid input. */
    public static fromHex(hex: string): Uint8Array {
        if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(hex)) {
            throw new Error(`invalid hex string: '${hex}'`);
        }
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        return bytes;
    }

    /** Hex digits of each byte. Kept for compatibility; prefer toHex(). */
    public static toHexArray(blob: Blob): Promise<string[]>;
    public static toHexArray(data: Uint8Array): Promise<string[]>;
    public static async toHexArray(data: Uint8Array | Blob): Promise<string[]> {
        const bytes = await this.toBytes(data);
        return Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
    }

    /** True if the string is a full 40-character hex object id. */
    public static isValidHash(hash: string): boolean {
        return hash.length === HASH_HEX_LENGTH && /^[0-9a-f]+$/.test(hash);
    }

    // ---------------------------------------------------------------------
    // Hashing
    // ---------------------------------------------------------------------

    public static async sha1(data: Uint8Array): Promise<Uint8Array> {
        const hash = await crypto.subtle.digest("SHA-1", data as BufferSource);
        return new Uint8Array(hash);
    }

    // ---------------------------------------------------------------------
    // zlib
    // ---------------------------------------------------------------------

    public static compressZLib(data: Uint8Array): Uint8Array {
        return zlibSync(data, {level: 6});
    }

    public static decompressZLib(data: Uint8Array): Uint8Array {
        return unzlibSync(data);
    }

    // ---------------------------------------------------------------------
    // Git objects
    // ---------------------------------------------------------------------

    /** Build the raw object bytes "<type> <size>\0<content>". This is what gets hashed. */
    public static createObjectData(type: ObjectType, content: Uint8Array): Uint8Array {
        const header = this.createByteArray(`${type} ${content.length}\0`);
        return this.concat(header, content);
    }

    /** Hash an object and produce its compressed on-disk form. */
    public static async hashObject(type: ObjectType, content: Uint8Array | Blob): Promise<HashedObject> {
        const bytes = await this.toBytes(content);
        const full = this.createObjectData(type, bytes);
        const rawHash = await this.sha1(full);
        return {
            hash: this.toHex(rawHash),
            rawHash,
            compressed: this.compressZLib(full),
        };
    }

    /** Compute only the hex hash, without compressing (like `git hash-object` without -w). */
    public static async hashOnly(type: ObjectType, content: Uint8Array | Blob): Promise<string> {
        const bytes = await this.toBytes(content);
        return this.toHex(await this.sha1(this.createObjectData(type, bytes)));
    }

    /** Compress an object for storage without returning its hash. */
    public static async compressZLibObject(type: ObjectType, content: Uint8Array | Blob): Promise<Uint8Array> {
        const bytes = await this.toBytes(content);
        return this.compressZLib(this.createObjectData(type, bytes));
    }

    /** Decompress a stored object and split it into type and content, validating the header. */
    public static parseObject(compressed: Uint8Array): ParsedObject {
        const full = this.decompressZLib(compressed);
        const nul = full.indexOf(0);
        if (nul === -1) {
            throw new Error("corrupt object: missing header terminator");
        }

        const header = this.fromByteArray(full.subarray(0, nul));
        const space = header.indexOf(" ");
        if (space === -1) {
            throw new Error(`corrupt object: malformed header '${header}'`);
        }

        const type = header.slice(0, space);
        const sizeStr = header.slice(space + 1);
        if (!OBJECT_TYPES.has(type)) {
            throw new Error(`corrupt object: unknown type '${type}'`);
        }
        if (!/^\d+$/.test(sizeStr)) {
            throw new Error(`corrupt object: invalid size '${sizeStr}'`);
        }

        const content = full.subarray(nul + 1);
        if (content.length !== Number(sizeStr)) {
            throw new Error(`corrupt object: header says ${sizeStr} bytes, found ${content.length}`);
        }

        return {type: type as ObjectType, content};
    }

    /** Check that a stored object's content actually hashes to the expected id. */
    public static async verifyObject(expectedHash: string, compressed: Uint8Array): Promise<boolean> {
        const full = this.decompressZLib(compressed);
        return this.toHex(await this.sha1(full)) === expectedHash;
    }

    /** Split a hex hash into its loose-object location: ["ce", "0136...a"]. */
    public static objectPath(hash: string): [dir: string, file: string] {
        if (!this.isValidHash(hash)) {
            throw new Error(`invalid object id: '${hash}'`);
        }
        return [hash.slice(0, 2), hash.slice(2)];
    }

    /** Raw 20-byte hash -> hex, with a length check (useful when parsing tree entries). */
    public static rawHashToHex(raw: Uint8Array): string {
        if (raw.length !== HASH_BYTE_LENGTH) {
            throw new Error(`expected ${HASH_BYTE_LENGTH} hash bytes, got ${raw.length}`);
        }
        return this.toHex(raw);
    }
}