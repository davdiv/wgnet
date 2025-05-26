import type { WgConfig } from "./type";

const outputFormats = {
	wg: async () => (await import("./wg/formatter")).formatWgConfig,
	ifstate: async () => (await import("./ifstate/formatter")).ifstateFormatter,
	qrcode: async () => (await import("./wg/formatQRCode")).formatSVGQRCode,
	"systemd-netdev-cleartext": async () => (await import("./systemdNetworkd/formatter")).formatSystemdNetworkdNetdevWithoutSystemdCreds,
	"systemd-netdev-systemd-creds": async () => (await import("./systemdNetworkd/formatter")).formatSystemdNetworkdNetdevWithSystemdCreds,
	"systemd-network": async () => (await import("./systemdNetworkd/formatter")).formatSystemdNetworkdNetwork,
	"systemd-creds": async () => (await import("./systemd-creds")).formatSystemdCreds,
	nm: async () => (await import("./networkManager/formatter")).formatNetworkManager,
};

export type OutputFormat = keyof typeof outputFormats;
export const availableOutputFormats = Object.keys(outputFormats) as OutputFormat[];
const nonSecretFormats = new Set<OutputFormat>(["systemd-network", "systemd-netdev-systemd-creds"]);

export const isValidOutputFormat = (format: string): format is OutputFormat => availableOutputFormats.includes(format as any);
export const isSecretOutputFormat = (format: OutputFormat | null) => !!(format && !nonSecretFormats.has(format));

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
	"systemd-netdev-cleartext": ".netdev",
	"systemd-netdev-systemd-creds": ".netdev",
	"systemd-network": ".network",
	nm: ".nmconnection",
	"systemd-creds": ".sh",
};
