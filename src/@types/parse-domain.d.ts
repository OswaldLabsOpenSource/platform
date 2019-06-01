declare namespace parseDomain {
  interface ParseOptions {
    customTlds?: RegExp | Array<string>;
    privateTlds?: boolean;
  }

  interface ParsedDomain {
    domain: string;
    subdomain: string;
    tld: string;
  }
}

declare module "parse-domain" {
  export default function(
    url: string,
    options?: parseDomain.ParseOptions
  ): parseDomain.ParsedDomain | null;
}
