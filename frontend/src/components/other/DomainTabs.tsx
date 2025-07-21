import React, { FC } from "react";
import { Tabs, Tab } from "@nextui-org/react";
import DomainTabContent from "./DomainTabContent";
import { ResultDataDTO } from "@/types/dtos";

interface DomainTabsProps {
  data: ResultDataDTO;
  DOMAIN_DESCRIPTIONS: Record<string, React.ReactElement>;
  DOMAIN_LABELS: Record<string, string>;
  FACET_LABELS: Record<string, string>;
}

const DomainTabs: FC<DomainTabsProps> = ({ data, DOMAIN_DESCRIPTIONS, DOMAIN_LABELS, FACET_LABELS }) => (
  <Tabs aria-label="Domain Results" color="secondary" variant="underlined" fullWidth className="mt-6">
    {Object.entries(data.domains).map(([domainKey, domainData]) => (
      <Tab key={domainKey} title={DOMAIN_LABELS[domainKey]}>
        <DomainTabContent
          domain={domainKey}
          data={domainData}
          DOMAIN_DESCRIPTIONS={DOMAIN_DESCRIPTIONS}
          DOMAIN_LABELS={DOMAIN_LABELS}
          FACET_LABELS={FACET_LABELS}
        />
      </Tab>
    ))}
  </Tabs>
);

export default DomainTabs;
