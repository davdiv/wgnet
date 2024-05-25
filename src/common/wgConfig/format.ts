import type { WgConfig } from "./type";

const outputFormats = {
	wg: async () => (await import("./wg/formatter")).formatWgConfig,
	ifstate: async () => (await import("./ifstate/formatter")).ifstateFormatter,
	qrcode: async () => (await import("./wg/formatQRCode")).formatSVGQRCode,
	"systemd-netdev": async () => (await import("./systemdNetworkd/formatter")).formatSystemdNetworkdNetdev,
	"systemd-network": async () => (await import("./systemdNetworkd/formatter")).formatSystemdNetworkdNetwork,
	nm: async () => (await import("./networkManager/formatter")).formatNetworkManager,
};

export type OutputFormat = keyof typeof outputFormats;
export const availableOutputFormats = Object.keys(outputFormats) as OutputFormat[];

export const isValidOutputFormat = (format: string): format is OutputFormat => availableOutputFormats.includes(format as any);

export const formatConfig = async (format: OutputFormat, config: WgConfig) => {
	const formatter = await outputFormats[format]();
	return formatter(config);
};

export const outputFormatMimeType: Partial<Record<OutputFormat, string>> = {
	qrcode: "image/svg+xml",
};

export const outputFormatExtension: Record<OutputFormat, string> = {
	wg: ".conf",
	ifstate: ".yml",
	qrcode: ".svg",
	"systemd-netdev": ".netdev",
	"systemd-network": ".network",
	nm: ".nmconnection",
};
