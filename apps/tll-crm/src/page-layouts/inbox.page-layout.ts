import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  INBOX_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  INBOX_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  INBOX_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  INBOX_PAGE_WIDGET_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: INBOX_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Inbox',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: INBOX_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Inbox',
      position: 0,
      icon: 'IconInbox',
      // CANVAS gives the single widget the whole tab viewport, which the
      // three-pane layout needs; VERTICAL_LIST would size it to its content.
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: INBOX_PAGE_WIDGET_UNIVERSAL_IDENTIFIER,
          title: ' ',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              INBOX_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
