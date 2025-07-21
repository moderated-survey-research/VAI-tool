import React, { FC } from "react";
import { Chip } from "@nextui-org/react";
import { DomainResultDataDTO } from "@/types/dtos";

interface DomainTabContentProps {
  domain: string;
  data: DomainResultDataDTO;
  DOMAIN_DESCRIPTIONS: Record<string, React.ReactElement>;
  DOMAIN_LABELS: Record<string, string>;
  FACET_LABELS: Record<string, string>;
}

const DomainTabContent: FC<DomainTabContentProps> = ({
  domain,
  data,
  DOMAIN_DESCRIPTIONS,
  DOMAIN_LABELS,
  FACET_LABELS,
}) => {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mt-2 mb-4">
        {DOMAIN_LABELS[domain]}
        <span className="ml-4 font-light">{data.score}</span>
      </h3>
      {data.facets ? (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(data.facets).map(([facet, score]) => (
            <Chip key={facet} color="secondary" variant="faded">
              <div className="flex justify-between gap-4">
                <p>{FACET_LABELS[facet]}</p>
                <p>{score}</p>
              </div>
            </Chip>
          ))}
        </div>
      ) : null}
      {DOMAIN_DESCRIPTIONS[domain]}
    </div>
  );
};

export default DomainTabContent;
