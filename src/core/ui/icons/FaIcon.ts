import {Icon} from "./Icon";
import {HTMLUtils} from "../../../editor/utils/HTMLUtils";

type FaIconFamily = "fa-solid" | "fa-regular" | "fa-brands";

const BRAND_ICON_NAMES = new Set<string>([
    "github", "twitter", "facebook", "instagram", "linkedin", "youtube", "google", "apple", "microsoft", "amazon",
    "slack", "discord", "spotify", "whatsapp", "telegram", "tiktok", "reddit", "pinterest", "figma", "wordpress",
    "dropbox", "paypal", "stripe", "bitcoin", "ethereum"
]);

const SUPPORTED_FA_ICON_NAMES = [
    "house", "magnifying-glass", "user", "check", "xmark", "bars", "gear", "bell", "heart", "star",
    "chevron-down", "chevron-up", "chevron-left", "chevron-right", "arrow-right", "arrow-left", "arrow-up", "arrow-down",
    "ellipsis", "ellipsis-vertical", "plus", "minus", "trash", "pen", "pen-to-square", "floppy-disk", "share", "share-nodes",
    "download", "upload", "filter", "sort", "circle-info", "circle-question", "circle-exclamation", "circle-check", "circle-xmark",
    "eye", "eye-slash", "lock", "unlock", "key", "link", "paperclip", "magnifying-glass-plus", "magnifying-glass-minus",
    "rotate-right", "rotate-left", "power-off", "toggle-on", "toggle-off", "envelope", "phone", "message", "comment", "comments",
    "paper-plane", "inbox", "at", "rss", "language", "globe", "hashtag", "address-book", "address-card", "user-group", "user-plus",
    "user-minus", "user-gear", "handshake", "thumbs-up", "thumbs-down", "bullhorn", "flag", "quote-left", "quote-right", "play",
    "pause", "stop", "forward", "backward", "volume-high", "volume-low", "volume-xmark", "music", "video", "camera", "image",
    "images", "film", "microphone", "headphones", "clapperboard", "tv", "podcast", "palette", "brush", "dropper", "crop", "scissors",
    "layer-group", "briefcase", "chart-line", "chart-bar", "chart-pie", "chart-area", "credit-card", "money-bill", "money-bill-1",
    "dollar-sign", "euro-sign", "sterling-sign", "wallet", "vault", "cash-register", "piggy-bank", "coins", "receipt", "tags",
    "cart-shopping", "bag-shopping", "store", "shop", "building", "city", "industry", "truck", "box", "boxes-stacked", "warehouse",
    "barcode", "qrcode", "file", "file-lines", "file-pdf", "file-word", "file-excel", "file-powerpoint", "file-image", "file-code",
    "file-zipper", "folder", "folder-open", "folder-plus", "copy", "paste", "note-sticky", "book", "bookmark", "book-open", "newspaper",
    "signature", "code", "code-branch", "terminal", "database", "server", "desktop", "laptop", "tablet-screen-button",
    "mobile-screen-button", "microchip", "memory", "hard-drive", "wifi", "signal", "battery-full", "battery-half", "battery-empty",
    "plug", "bolt", "cloud", "cloud-arrow-up", "cloud-arrow-down", "bug", "screwdriver-wrench", "wrench", "hammer", "robot",
    "location-dot", "map", "map-pin", "compass", "plane", "car", "bus", "train", "bicycle", "motorcycle", "ship", "hotel", "suitcase",
    "umbrella", "sun", "moon", "cloud-sun", "cloud-moon", "cloud-rain", "snowflake", "wind", "mountain", "tree", "leaf", "fire",
    "heart-pulse", "hospital", "stethoscope", "suitcase-medical", "pills", "syringe", "bandage", "user-doctor", "user-nurse", "brain",
    "dna", "weight-scale", "person-running", "person-walking", "dumbbell", "kit-medical", "graduation-cap", "school", "chalkboard", "pencil",
    "pen-nib", "microscope", "flask", "vial", "atom", "infinity", "compass-drafting", "ruler", "calculator", "lightbulb", "bed", "couch",
    "bath", "shower", "sink", "toilet", "soap", "broom", "utensils", "spoon", "mug-hot", "coffee", "glass-water", "wine-glass", "burger",
    "pizza-slice", "ice-cream", "apple-whole", "carrot", "fish", "gift", "cake-candles", "balloon", "trophy", "medal", "crown", "gem",
    "diamond", "anchor", "shield", "clock", "hourglass", "calendar", "calendar-days", "stopwatch", "binoculars", "ghost", "skull", "mask",
    "puzzle-piece", "gamepad", "dice", "github", "twitter", "facebook", "instagram", "linkedin", "youtube", "google", "apple", "microsoft",
    "amazon", "slack", "discord", "spotify", "whatsapp", "telegram", "tiktok", "reddit", "pinterest", "figma", "wordpress", "dropbox",
    "paypal", "stripe", "bitcoin", "ethereum", "indent", "outdent", "align-left", "align-center", "align-right", "align-justify", "bold",
    "italic", "underline", "strikethrough", "list-ul", "list-ol", "expand", "compress", "arrows-up-down", "arrows-left-right",
    "arrow-up-right-from-square", "grip", "grip-vertical", "square", "circle", "border-all", "border-none", "table-cells", "columns-3"
] as const;

export type SupportedFaIconName = typeof SUPPORTED_FA_ICON_NAMES[number];


export class FaIcon extends Icon {
    private constructor(private readonly name: string, private readonly type: FaIconFamily) {
        super(HTMLUtils.createElement(`i.${type}.${name}`));
    }

    static of(name: string, family: FaIconFamily = "fa-solid"): FaIcon {
        return new FaIcon(FaIcon.normalizeName(name), family);
    }

    static auto(name: string): FaIcon {
        const normalized = name.startsWith("fa-") ? name.slice(3) : name;
        const family: FaIconFamily = BRAND_ICON_NAMES.has(normalized) ? "fa-brands" : "fa-solid";
        return FaIcon.of(normalized, family);
    }

    static brands(name: string): FaIcon {
        return FaIcon.of(name, "fa-brands");
    }

    static solid(name: string): FaIcon {
        return FaIcon.of(name, "fa-solid");
    }

    static regular(name: string): FaIcon {
        return FaIcon.of(name, "fa-regular");
    }

    static named(name: SupportedFaIconName): FaIcon {
        return FaIcon.auto(name);
    }

    static supportedNames(): readonly SupportedFaIconName[] {
        return SUPPORTED_FA_ICON_NAMES;
    }

    static faHome(): FaIcon {
        return FaIcon.solid('house');
    }

    static faUser(): FaIcon {
        return FaIcon.solid('user');
    }

    static faUsers(): FaIcon {
        return FaIcon.solid('users');
    }

    static faCog(): FaIcon {
        return FaIcon.solid('gear');
    }

    static faSearch(): FaIcon {
        return FaIcon.solid('magnifying-glass');
    }

    static faTimes(): FaIcon {
        return FaIcon.solid('xmark');
    }

    static faCheck(): FaIcon {
        return FaIcon.solid('check');
    }

    static faPlus(): FaIcon {
        return FaIcon.solid('plus');
    }

    static faMinus(): FaIcon {
        return FaIcon.solid('minus');
    }

    static faTrash(): FaIcon {
        return FaIcon.solid('trash');
    }

    static faEdit(): FaIcon {
        return FaIcon.solid('pen');
    }

    static faPencil(): FaIcon {
        return FaIcon.solid('pencil');
    }

    static faDownload(): FaIcon {
        return FaIcon.solid('download');
    }

    static faUpload(): FaIcon {
        return FaIcon.solid('upload');
    }

    static faCloudDownload(): FaIcon {
        return FaIcon.solid('cloud-arrow-down');
    }

    static faCloudUpload(): FaIcon {
        return FaIcon.solid('cloud-arrow-up');
    }

    static faFolder(): FaIcon {
        return FaIcon.solid('folder');
    }

    static faFolderOpen(): FaIcon {
        return FaIcon.solid('folder-open');
    }

    static faFile(): FaIcon {
        return FaIcon.solid('file');
    }

    static faFileText(): FaIcon {
        return FaIcon.solid('file-lines');
    }

    static faImage(): FaIcon {
        return FaIcon.solid('image');
    }

    static faCamera(): FaIcon {
        return FaIcon.solid('camera');
    }

    static faVideo(): FaIcon {
        return FaIcon.solid('video');
    }

    static faMusic(): FaIcon {
        return FaIcon.solid('music');
    }

    static faPlay(): FaIcon {
        return FaIcon.solid('play');
    }

    static faPause(): FaIcon {
        return FaIcon.solid('pause');
    }

    static faStop(): FaIcon {
        return FaIcon.solid('stop');
    }

    static faForward(): FaIcon {
        return FaIcon.solid('forward');
    }

    static faBackward(): FaIcon {
        return FaIcon.solid('backward');
    }

    static faRepeat(): FaIcon {
        return FaIcon.solid('repeat');
    }

    static faShuffle(): FaIcon {
        return FaIcon.solid('shuffle');
    }

    static faHeart(): FaIcon {
        return FaIcon.solid('heart');
    }

    static faStar(): FaIcon {
        return FaIcon.solid('star');
    }

    static faBookmark(): FaIcon {
        return FaIcon.solid('bookmark');
    }

    static faBell(): FaIcon {
        return FaIcon.solid('bell');
    }

    static faEnvelope(): FaIcon {
        return FaIcon.solid('envelope');
    }

    static faPhone(): FaIcon {
        return FaIcon.solid('phone');
    }

    static faComment(): FaIcon {
        return FaIcon.solid('comment');
    }

    static faComments(): FaIcon {
        return FaIcon.solid('comments');
    }

    static faCalendar(): FaIcon {
        return FaIcon.solid('calendar');
    }

    static faCalendarAlt(): FaIcon {
        return FaIcon.solid('calendar-days');
    }

    static faClock(): FaIcon {
        return FaIcon.solid('clock');
    }

    static faMap(): FaIcon {
        return FaIcon.solid('map');
    }

    static faMapMarkerAlt(): FaIcon {
        return FaIcon.solid('location-dot');
    }

    static faGlobe(): FaIcon {
        return FaIcon.solid('globe');
    }

    static faLink(): FaIcon {
        return FaIcon.solid('link');
    }

    static faLock(): FaIcon {
        return FaIcon.solid('lock');
    }

    static faUnlock(): FaIcon {
        return FaIcon.solid('unlock');
    }

    static faKey(): FaIcon {
        return FaIcon.solid('key');
    }

    static faShieldAlt(): FaIcon {
        return FaIcon.solid('shield');
    }

    static faEye(): FaIcon {
        return FaIcon.solid('eye');
    }

    static faEyeSlash(): FaIcon {
        return FaIcon.solid('eye-slash');
    }

    static faFlag(): FaIcon {
        return FaIcon.solid('flag');
    }

    static faTag(): FaIcon {
        return FaIcon.solid('tag');
    }

    static faTags(): FaIcon {
        return FaIcon.solid('tags');
    }

    static faShoppingCart(): FaIcon {
        return FaIcon.solid('cart-shopping');
    }

    static faShoppingBag(): FaIcon {
        return FaIcon.solid('bag-shopping');
    }

    static faCreditCard(): FaIcon {
        return FaIcon.solid('credit-card');
    }

    static faWallet(): FaIcon {
        return FaIcon.solid('wallet');
    }

    static faDollarSign(): FaIcon {
        return FaIcon.solid('dollar-sign');
    }

    static faReceipt(): FaIcon {
        return FaIcon.solid('receipt');
    }

    static faChartLine(): FaIcon {
        return FaIcon.solid('chart-line');
    }

    static faChartBar(): FaIcon {
        return FaIcon.solid('chart-bar');
    }

    static faChartPie(): FaIcon {
        return FaIcon.solid('chart-pie');
    }

    static faTable(): FaIcon {
        return FaIcon.solid('table');
    }

    static faList(): FaIcon {
        return FaIcon.solid('list');
    }

    static faTasks(): FaIcon {
        return FaIcon.solid('list-check');
    }

    static faFilter(): FaIcon {
        return FaIcon.solid('filter');
    }

    static faSort(): FaIcon {
        return FaIcon.solid('sort');
    }

    static faArrowUp(): FaIcon {
        return FaIcon.solid('arrow-up');
    }

    static faArrowDown(): FaIcon {
        return FaIcon.solid('arrow-down');
    }

    static faArrowLeft(): FaIcon {
        return FaIcon.solid('arrow-left');
    }

    static faArrowRight(): FaIcon {
        return FaIcon.solid('arrow-right');
    }

    static faChevronUp(): FaIcon {
        return FaIcon.solid('chevron-up');
    }

    static faChevronDown(): FaIcon {
        return FaIcon.solid('chevron-down');
    }

    static faChevronLeft(): FaIcon {
        return FaIcon.solid('chevron-left');
    }

    static faChevronRight(): FaIcon {
        return FaIcon.solid('chevron-right');
    }

    static faAngleDoubleUp(): FaIcon {
        return FaIcon.solid('angles-up');
    }

    static faAngleDoubleDown(): FaIcon {
        return FaIcon.solid('angles-down');
    }

    static faAngleDoubleLeft(): FaIcon {
        return FaIcon.solid('angles-left');
    }

    static faAngleDoubleRight(): FaIcon {
        return FaIcon.solid('angles-right');
    }

    static faInfoCircle(): FaIcon {
        return FaIcon.solid('circle-info');
    }

    static faQuestionCircle(): FaIcon {
        return FaIcon.solid('circle-question');
    }

    static faExclamationTriangle(): FaIcon {
        return FaIcon.solid('triangle-exclamation');
    }

    static faExclamationCircle(): FaIcon {
        return FaIcon.solid('circle-exclamation');
    }

    static faCheckCircle(): FaIcon {
        return FaIcon.solid('circle-check');
    }

    static faTimesCircle(): FaIcon {
        return FaIcon.solid('circle-xmark');
    }

    static faSpinner(): FaIcon {
        return FaIcon.solid('spinner');
    }

    static faSun(): FaIcon {
        return FaIcon.solid('sun');
    }

    static faMoon(): FaIcon {
        return FaIcon.solid('moon');
    }

    static faFire(): FaIcon {
        return FaIcon.solid('fire');
    }

    static faBolt(): FaIcon {
        return FaIcon.solid('bolt');
    }

    static faLeaf(): FaIcon {
        return FaIcon.solid('leaf');
    }

    static faGift(): FaIcon {
        return FaIcon.solid('gift');
    }

    static faTrophy(): FaIcon {
        return FaIcon.solid('trophy');
    }

    static faMedal(): FaIcon {
        return FaIcon.solid('medal');
    }

    static faWrench(): FaIcon {
        return FaIcon.solid('wrench');
    }

    static faTools(): FaIcon {
        return FaIcon.solid('screwdriver-wrench');
    }

    static faHammer(): FaIcon {
        return FaIcon.solid('hammer');
    }

    static faBug(): FaIcon {
        return FaIcon.solid('bug');
    }

    static faDiagramProject() {
        return FaIcon.solid('diagram-project');
    }

    private static normalizeName(name: string): string {
        return name.startsWith("fa-") ? name : `fa-${name}`;
    }

    draw(): void {
        // No need to draw anything, as the icon is represented by its CSS classes
    }

    solid(): FaIcon {
        return new FaIcon(this.name, "fa-solid");
    }

    regular(): FaIcon {
        return new FaIcon(this.name, "fa-regular");
    }

    brands(): FaIcon {
        return new FaIcon(this.name, "fa-brands");
    }
}
