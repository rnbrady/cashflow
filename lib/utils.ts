import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { 
  hexToBin,
  lockingBytecodeToCashAddress,
  disassembleBytecodeBCH
} from "@bitauth/libauth";

export function formatHexWithNewlines(hex: string): string {
  const charsPerLine = 128; // 64 bytes = 128 hex chars
  const lines = hex.match(new RegExp(`.{1,${charsPerLine}}`, 'g')) || [];
  return lines.join('\n');
}

export function formatTimestamp(timestamp: string): string {
  return new Date(parseInt(timestamp) * 1000).toLocaleString();
}

export function tryDecodeCashAddress(lockingBytecode: string | undefined): string {
  if (!lockingBytecode) return 'Unknown';

  try {
    // Remove \x prefix if present
    const cleanHex = lockingBytecode.replace(/^\\x/, '');
    const bytecode = hexToBin(cleanHex);
    const result = lockingBytecodeToCashAddress(
      bytecode,
      'bitcoincash'
    );
    if (typeof result !== 'string') {
      return '-';
    }
    return result;
  } catch (e) {
    console.error('Error decoding address:', e);
    return 'Could not decode address';
  }
}

export type ValueUnit = 'BCH' | 'sats' | 'USD';

export function formatValue(sats: string | null, unit: ValueUnit, usdRate?: number): string {
  if (!sats) return `0 ${unit}`;
  const value = parseInt(sats);
  
  switch (unit) {
    case 'sats':
      return `${value.toLocaleString()} sats`;
    case 'BCH':
      return `${(value / 100_000_000).toLocaleString(undefined, {
        minimumFractionDigits: 8,
        maximumFractionDigits: 8
      })} BCH`;
    case 'USD':
      if (usdRate === undefined) return 'Loading...';
      const usdValue = (value / 100_000_000) * usdRate;
      return `$${usdValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    default:
      return `${value.toLocaleString()} sats`;
  }
}

export function parseScript(lockingBytecode: string): string {
  try {
    const cleanHex = lockingBytecode.replace(/^\\x/, '');
    const bytecode = hexToBin(cleanHex);
    const result = disassembleBytecodeBCH(bytecode);
    if (typeof result === 'string') {
      return result;
    }
    return result;
  } catch (e) {
    console.error('Error parsing script:', e);
    return 'Could not parse script';
  }
}

export function getScriptType(lockingBytecodePattern: string | undefined, fullName: boolean = false): string {
  if (!lockingBytecodePattern) return 'Unknown';

  try {
    const script = lockingBytecodePattern.replace(/^\\x/, '');

    if (typeof script !== 'string') 
      return 'Invalid Script';

    if (fullName) {
      // Common script patterns
      if (script === '76a91488ac') {
        return 'P2PKH (Pay to Public Key Hash)';
      }
      if (script === 'a91487') {
        return 'P2SH (Pay to Script Hash)';
      }
      if (script.startsWith('6a')) {
        return 'OP_RETURN (Data Carrier)';
      }
      return `${script}`;
    } else {
      // Common script patterns
      if (script === '76a91488ac') {
        return 'P2PKH';
      }
      if (script === 'a91487') {
        return 'P2SH';
      }
      if (script.startsWith('6a')) {
        return 'OP_RETURN';
      }
      return `${script}`;
    }
  } catch (e) {
    console.error('Error parsing script type:', e);
    return 'Could not determine type';
  }
} 

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a color from a hash string
export const hashToColor = (hash: string | undefined | null) => {
  if (!hash) return "lightgray"

  // Take the first 6 characters of the hash and use as a hex color
  const color = `#${hash.substring(0, 6)}`

  // Check if it's a valid hex color
  if (/^#[0-9A-F]{6}$/i.test(color)) {
    return color
  }

  // If not valid, generate a color based on hash sum
  let sum = 0
  for (let i = 0; i < hash.length; i++) {
    sum += hash.charCodeAt(i)
  }

  // Generate hue based on hash (0-360)
  const hue = sum % 360
  // Use a fixed saturation and lightness for good visibility
  return `hsl(${hue}, 70%, 60%)`
}

export const truncateHash = (hash: string | undefined | null, length: number = 4) => {
  if (!hash) return ""
  const cleanHash = hash.replace(/^\\x/, '');
  return `${cleanHash.substring(0, length)}...${cleanHash.substring(cleanHash.length - length)}`
}

// Helper to generate a contrasting text color based on background
export const getContrastColor = (hexColor: string) => {
  // Convert hex to RGB
  let r = 0,
    g = 0,
    b = 0

  if (hexColor.startsWith("#")) {
    r = Number.parseInt(hexColor.slice(1, 3), 16)
    g = Number.parseInt(hexColor.slice(3, 5), 16)
    b = Number.parseInt(hexColor.slice(5, 7), 16)
  } else if (hexColor.startsWith("hsl")) {
    // For HSL colors, just use a simple heuristic
    const match = hexColor.match(/hsl$$(\d+),\s*(\d+)%,\s*(\d+)%$$/)
    if (match) {
      const l = Number.parseInt(match[3])
      return l > 50 ? "#000000" : "#ffffff"
    }
    return "#ffffff"
  }

  // Calculate perceived brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  // Return black or white based on brightness
  return brightness > 128 ? "#000000" : "#ffffff"
}
