CREATE TYPE widgets.config (
  title text,
  x int,
  y int,
  width int,
  height int
);
---
CREATE TYPE widgets.widget_view (
  "view" text,
  "viewPathPrefix" text,
  "viewConfig" text
);
---
CREATE TABLE userwidgets (
  id uuid,
  user_id text,
  config frozen <config>,
  "contentConfig" map<text, frozen <widget_view>>,

  PRIMARY KEY(id, user_id)
);
