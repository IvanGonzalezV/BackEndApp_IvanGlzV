import { fileURLToPath } from "url"
import { dirname } from "path"
import crypto from "crypto"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function generateToken() {
  return crypto.randomBytes(20).toString("hex");
}
export default __dirname