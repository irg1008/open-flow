import { paraglideMiddleware } from "@/i18n/_generated/server.js";
import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

export default createServerEntry({
  fetch: (req) => paraglideMiddleware(req, () => handler.fetch(req))
});
