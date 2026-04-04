import { createClient } from "@supabase/supabase-js";

export interface StorageService {
  upload(
    bucket: string,
    path: string,
    file: File | Buffer,
    contentType?: string
  ): Promise<{ url: string }>;
  getPublicUrl(bucket: string, path: string): string;
  delete(bucket: string, paths: string[]): Promise<void>;
}

class SupabaseStorageService implements StorageService {
  private client;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY");
    }
    this.client = createClient(url, key);
  }

  async upload(
    bucket: string,
    path: string,
    file: File | Buffer,
    contentType?: string
  ): Promise<{ url: string }> {
    const { error } = await this.client.storage
      .from(bucket)
      .upload(path, file, { contentType, upsert: true });

    if (error) throw new Error(`Upload failed: ${error.message}`);

    return { url: this.getPublicUrl(bucket, path) };
  }

  getPublicUrl(bucket: string, path: string): string {
    const {
      data: { publicUrl },
    } = this.client.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  }

  async delete(bucket: string, paths: string[]): Promise<void> {
    const { error } = await this.client.storage.from(bucket).remove(paths);
    if (error) throw new Error(`Delete failed: ${error.message}`);
  }
}

let storageInstance: StorageService | null = null;

export function getStorage(): StorageService {
  if (!storageInstance) {
    storageInstance = new SupabaseStorageService();
  }
  return storageInstance;
}
