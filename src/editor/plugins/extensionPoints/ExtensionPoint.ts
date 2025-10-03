import {IExtensionPointSupplier} from "./IExtensionPointSupplier";

export interface ExtensionPoint {
    name: string;
    instance: IExtensionPointSupplier;
}