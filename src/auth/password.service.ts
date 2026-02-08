import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";
import * as crypto from "crypto";

@Injectable()
export class PasswordService {
  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
    /* 
      return await argon2.hash(password, {
          type: argon2.argon2id,   // strongest variant
          memoryCost: 2 ** 16,     // 64 MB
          timeCost: 3,             // iterations
          parallelism: 1,          // threads
        });
      }
    */
  }

  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    if (storedHash.startsWith("$argon2")) {
      return await argon2.verify(storedHash, password);
    } else {
      return this.verifyAspNetIdentityHash(password, storedHash);
    }
  }

  private verifyAspNetIdentityHash(password: string, hashBase64: string): boolean {
    const hashBytes = Buffer.from(hashBase64, "base64");
    const salt = hashBytes.subarray(13, 29);
    const storedSubkey = hashBytes.subarray(29);
    const derivedKey = crypto.pbkdf2Sync(password, salt, 10000, storedSubkey.length, "sha256");
    return crypto.timingSafeEqual(storedSubkey, derivedKey);
  }
}
