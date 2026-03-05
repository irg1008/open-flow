import { BmcIcon } from "@/components/ui/svgs/bmc";
import { CreemIcon } from "@/components/ui/svgs/creem";
import { GithubIcon } from "@/components/ui/svgs/github";
import { GitlabIcon } from "@/components/ui/svgs/gitlab";
import { OpenCIcon } from "@/components/ui/svgs/openc";
import { PatreonIcon } from "@/components/ui/svgs/patreon";
import { PolarShIcon } from "@/components/ui/svgs/polarSh";
import { StripeIcon } from "@/components/ui/svgs/stripe";
import { GithubIntegration } from "@/features/github/GithubIntegration";
import { m } from "@/i18n/_generated/messages";
import { ComponentType, ReactNode } from "react";
import { parse } from "yaml";
import z from "zod";
import { parseRemoteMarkdown } from "../../../lib/markdown";

export type RemoteGithubOptions = {
  owner: string;
  repo: string;
  branch?: string;
};

const getGithubRawUrl = (
  { owner, repo, branch = "HEAD" }: RemoteGithubOptions,
  filePath: string
) => {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
};

export const parseRemoteGithubMarkdown = async (opts: RemoteGithubOptions) => {
  const rawUrl = getGithubRawUrl(opts, "");
  const markdownNameVariants = ["README.md", "readme.md", "Readme.md"];

  for (const markdownName of markdownNameVariants) {
    const markdownUrl = `${rawUrl}${markdownName}`;
    const result = await parseRemoteMarkdown(markdownUrl, rawUrl, { gfm: true });
    if (result) return result;
  }

  return null;
};

const githubFundingSchema = z
  .record(
    z.string(),
    z
      .union([z.string(), z.array(z.string())])
      .nullable()
      .optional()
  )
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one funding option must be provided"
  });

export type GithubFunding = z.infer<typeof githubFundingSchema>;

export const parseRemoteGithubFunding = async (opts: RemoteGithubOptions) => {
  const rawUrl = getGithubRawUrl(opts, "");
  const fundingNameVariants = [".github/FUNDING.yml"];

  for (const fundingName of fundingNameVariants) {
    const fundingUrl = `${rawUrl}${fundingName}`;
    const res = await fetch(fundingUrl);
    if (!res.ok) continue;

    try {
      const text = await res.text();
      const content = parse(text);
      return githubFundingSchema.parse(content);
    } catch (error) {
      throw new Error(`Error parsing funding YAML`, {
        cause: Error.isError(error) ? error.message : undefined
      });
    }
  }
};

type Integration = {
  name: string;
  label: string;
  icon: ReactNode;
  content?: ComponentType;
};

export const integrations: Integration[] = [
  { name: "github", label: "Github", icon: <GithubIcon />, content: GithubIntegration },
  { name: "gitlab", label: "Gitlab", icon: <GitlabIcon /> },
  { name: "github-sponsors", label: "Github Sponsors", icon: <GithubIcon /> },
  { name: "polar", label: "Polar", icon: <PolarShIcon /> },
  { name: "stripe", label: "Stripe", icon: <StripeIcon /> },
  { name: "creem", label: "Creem", icon: <CreemIcon /> },
  { name: "patreon", label: "Patreon", icon: <PatreonIcon /> },
  { name: "bmc", label: "Buy Me A Coffee", icon: <BmcIcon /> },
  { name: "open-collective", label: "Open Collective", icon: <OpenCIcon /> }
];

// Future: paypal, lfx crowdfunding, ko-fi, liberapay, issuehunt, community bridge, etc

export const platformsNames = [
  "community_bridge",
  "github",
  "issuehunt",
  "lfx_crowdfunding",
  "ko_fi",
  "liberapay",
  "open_collective",
  "patreon",
  "tidelift",
  "polar",
  "buy_me_a_coffee",
  "thanks.dev",
  "custom"
] as const;

type PlatformName = (typeof platformsNames)[number];

export type PlatformInfo = {
  name: PlatformName;
  baseUrl: string;
  detailPath?: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
};

export const platformsInfo: PlatformInfo[] = [
  {
    name: "community_bridge",
    label: "Community Bridge",
    baseUrl: "https://funding.communitybridge.org",
    detailPath: "projects"
  },
  {
    name: "github",
    label: "Github Sponsors",
    baseUrl: "https://github.com",
    detailPath: "sponsors"
  },
  {
    name: "issuehunt",
    label: "Issuehunt",
    baseUrl: "https://issuehunt.com",
    detailPath: "programs"
  },
  {
    name: "lfx_crowdfunding",
    label: "LFX Crowdfunding",
    baseUrl: "https://crowdfunding.lfx.linuxfoundation.org",
    detailPath: "projects"
  },
  {
    name: "ko_fi",
    label: "Ko-fi",
    baseUrl: "https://ko-fi.com"
  },
  {
    name: "liberapay",
    label: "Liberapay",
    baseUrl: "https://liberapay.com"
  },
  {
    name: "open_collective",
    label: "Open Collective",
    baseUrl: "https://opencollective.com"
  },
  {
    name: "patreon",
    label: "Patreon",
    baseUrl: "https://www.patreon.com"
  },
  {
    name: "tidelift",
    label: "Tidelift",
    baseUrl: "https://tidelift.com",
    detailPath: "lifter/search"
  },
  {
    name: "polar",
    label: "Polar",
    baseUrl: "https://polar.sh",
    disabled: true // Project link points to 404 page
  },
  {
    name: "buy_me_a_coffee",
    label: "Buy Me A Coffee",
    baseUrl: "https://www.buymeacoffee.com"
  },
  {
    name: "thanks.dev",
    label: "Thanks.dev",
    baseUrl: "https://thanks.dev"
  },
  {
    name: "custom",
    label: m.sponsor_platform_custom(),
    baseUrl: ""
  }
];

export const getPlatformInfo = (name: string, value?: GithubFunding[string]) => {
  if (!value) return null;

  const info = platformsInfo.find((platform) => platform.name === name);
  if (!info) return null;

  const values = Array.isArray(value) ? value : [value];
  const urls = values.map((val) => [info.baseUrl, info.detailPath, val].filter(Boolean).join("/"));

  return { ...info, urls };
};
