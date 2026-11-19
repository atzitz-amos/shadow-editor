/**
 *
 * @author Atzitz Amos
 * @date 11/17/2026
 * @since 1.0.0
 */
export abstract class AbstractURINavigate {
    abstract doNavigate(): Promise<void>;

    abstract restore(): Promise<void>;
}
