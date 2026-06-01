import {Serializer} from "./Serializer";

/**
 * @author Atzitz Amos
 * @date 5/30/2026
 * @since 1.0.0
 */
export class SerializationUtils {
    static serialize(obj: any): string {
        return JSON.stringify(new Serializer().serializeObject(obj));
    }

    static getSerializableClassName(obj: any): string {
        // If a class constructor is passed, get its prototype directly
        let proto = Object.getPrototypeOf(obj);

        while (proto !== null && proto !== Object.prototype) {
            if (Object.prototype.hasOwnProperty.call(proto, "serialize")) {
                return proto.constructor.name;
            }
            proto = Object.getPrototypeOf(proto);
        }

        return typeof obj;
    }

    static getClassName(cls: any): string {
        return cls.name;
    }
}