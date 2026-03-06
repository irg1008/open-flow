import { Badge } from "@/components/ui/badge";
import { getPlatformInfo, GithubFunding, type PlatformInfo } from "@/features/github/lib/github";
import { LinkIcon } from "lucide-react";
import { useMemo } from "react";

export type RepoFundingsProps = {
  funding: GithubFunding;
};

type FundingBadgeProps = { info: PlatformInfo; url: string };

const FundingBadge = ({ info, url }: FundingBadgeProps) => {
  const baseUrl = new URL(url.startsWith("http") ? url : `https://${url}`);

  const iconFallback =
    info.name === "custom" ? (
      <LinkIcon />
    ) : (
      <img
        src={`${baseUrl.origin}/favicon.ico`}
        alt={`${info.name} favicon`}
        className="ml-1 inline-block h-4 w-4"
      />
    );

  return (
    <Badge asChild key={url} variant="outline">
      <a href={baseUrl.href} target="_blank" rel="noopener noreferrer">
        {info.icon ?? iconFallback}
        <span>{info.name === "custom" ? `${baseUrl.host}${baseUrl.pathname}` : info.label}</span>
      </a>
    </Badge>
  );
};

export const RepoFundings = ({ funding }: RepoFundingsProps) => {
  const availableFundings = useMemo(() => {
    return Object.entries(funding).map(([name, value]) => getPlatformInfo(name, value));
  }, [funding]);

  return (
    <div className="mt-4 mb-8 flex gap-2">
      {availableFundings.flatMap((info) =>
        info?.urls.map((url) => <FundingBadge key={url} info={info} url={url} />)
      )}
    </div>
  );
};
