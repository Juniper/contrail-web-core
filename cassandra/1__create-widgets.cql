CREATE TYPE config (
  title text,
  x int,
  y int,
  width int,
  height int
);
---
CREATE TYPE widget_view (
  "view" text,
  "viewPathPrefix" text,
  "viewConfig" text
);
---
CREATE TABLE user_widgets (
  id uuid,
  "userId" text,
  "dashboardId" text,
  "tabId" text,
  config frozen <config>,
  "contentConfig" map<text, frozen <widget_view>>,

  PRIMARY KEY(id)
);
---
CREATE INDEX ON user_widgets ("userId");
