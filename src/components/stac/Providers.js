import React from "react";

import NewTabLink from "../controls/NewTabLink";
import LabeledValue from "../controls/LabeledValue";
import { useStac } from "./CollectionContext";

const Providers = () => {
  const { providers } = useStac();

  const providerList = providers.map((p, i) => {
    return (
      <span key={`provider-${p.name}`}>
        <NewTabLink href={p.url}>{p.name} </NewTabLink>({p.roles.join(", ")})
        {i < providers.length - 1 ? " | " : ""}
      </span>
    );
  });

  return <LabeledValue label="Providers">{providerList}</LabeledValue>;
};

export default Providers;
