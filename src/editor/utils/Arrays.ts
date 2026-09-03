/**
 *
 * @author Atzitz Amos
 * @date 9/3/2026
 * @since 1.0.0
 */
export class Arrays {
    public static range(from: number, to: number): number[] {
        const result: number[] = [];
        for (let i = from; i < to; i++) {
            result.push(i);
        }
        return result;
    }

    public static rangeInclusive(from: number, to: number): number[] {
        return Arrays.range(from, to + 1);
    }
}
