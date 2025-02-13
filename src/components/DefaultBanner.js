import React from "react";

const DefaultBanner = ({ children }) => {
  const wrapped = React.Children.map(children, child => (
    <div className="banner-item">{child}</div>
  ));

  const banner = (
    <div className="header-banner layout-row grid-content">{wrapped}</div>
  );

  return banner;
};

export default DefaultBanner;
