import { FileRoutesByTo } from "../routeTree.gen";
import { Locale } from "./_generated/runtime";

type RoutePath = keyof FileRoutesByTo;

const excludedPaths = ["api"] as const;

type PublicRoutePath = Exclude<RoutePath, `${string}${(typeof excludedPaths)[number]}${string}`>;

type TranslatedPathname = {
  pattern: string;
  localized: Array<[Locale, string]>;
};

export function toUrlPattern(path: string) {
  return (
    path
      // catch-all
      .replace(/\/\$$/, "/:path(.*)?")
      // optional parameters: {-$param}
      .replace(/\{-\$([a-zA-Z0-9_]+)\}/g, ":$1?")
      // named parameters: $param
      .replace(/\$([a-zA-Z0-9_]+)/g, ":$1")
      // remove trailing slash
      .replace(/\/+$/, "")
  );
}

export function createTranslatedPathnames(
  input: Record<PublicRoutePath, Record<Locale, string>>
): TranslatedPathname[] {
  return Object.entries(input).map(([pattern, locales]) => ({
    pattern: toUrlPattern(pattern),
    localized: Object.entries(locales).map(
      ([locale, path]) =>
        [locale as Locale, `/${locale}${toUrlPattern(path)}`] satisfies [Locale, string]
    )
  }));
}

// Add i18n routes here as needed. Import in vite.config.ts to apply
// More info at https://github.com/TanStack/router/blob/main/examples/react/start-i18n-paraglide/README.md

// export const translatedPathnames = createTranslatedPathnames({
//   "/": {
//     en: "/",
//     es: "/"
//   }
// });

// export const prerenderRoutes = ["/", "/about"].map((path) => ({
//   path: localizeHref(path),
//   prerender: { enabled: true }
// }));
