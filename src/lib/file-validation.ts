// PDF começa com %PDF- (0x25 0x50 0x44 0x46 0x2D)
const PDF_MAGIC = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);

export async function isPdfByMagic(file: File): Promise<boolean> {
  try {
    const head = await file.slice(0, PDF_MAGIC.length).arrayBuffer();
    const bytes = new Uint8Array(head);
    if (bytes.length < PDF_MAGIC.length) return false;
    for (let i = 0; i < PDF_MAGIC.length; i++) {
      if (bytes[i] !== PDF_MAGIC[i]) return false;
    }
    return true;
  } catch {
    return false;
  }
}
