import { toString as qrCode } from "qrcode";
import { formatWgConfig } from "./formatter";
import type { WgConfig } from "../type";

export const formatSVGQRCode = async (config: WgConfig) => await qrCode(formatWgConfig(config), { type: "svg" });
