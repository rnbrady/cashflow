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

export function tryDecodeCashAddress(lockingBytecode: string): string {
  try {
    // Remove \x prefix if present
    const cleanHex = lockingBytecode.replace(/^\\x/, '');
    const bytecode = hexToBin(cleanHex);
    const result = lockingBytecodeToCashAddress({
      bytecode,
      prefix: 'bitcoincash'
    });
    if (typeof result === 'string') {
      return 'Invalid locking bytecode';
    }
    return result.address;
  } catch (e) {
    console.error('Error decoding address:', e);
    return 'Could not decode address';
  }
}

export function formatSats(sats: string | null): string {
  if (!sats) return '0 sats';
  return `${parseInt(sats).toLocaleString()} sats`;
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