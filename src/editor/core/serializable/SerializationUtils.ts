
export class SerializationUtils {
    /**
     * Serialize any object into an object that only uses primitive types (number, string, arrays, objects).<br>
     * This method works even if the object contains circular references, as it stores all objects and their references differently<br>
     * <span style="color: #c2f195">**WARNING**: This will strip any functions from the object</span>
     *
     * @param value The object to serialize.
     * @return The serialized object.
     * */
    public static serializeAny(value: any): AnySerializationResult {
        // return AnySerializer.serialize(value);
    }

    public static deserializeAny(value: AnySerializationResult): any {
        // return AnySerializer.deserialize(value);
    }
}

