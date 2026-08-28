import { definePageLayout, PageLayoutTabLayoutMode } from 'twenty-sdk/define';

import {
  LOG_MY_DAY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  LOG_MY_DAY_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
  LOG_MY_DAY_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  LOG_MY_DAY_PAGE_WIDGET_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayout({
  universalIdentifier: LOG_MY_DAY_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Log my day',
  type: 'STANDALONE_PAGE',
  tabs: [
    {
      universalIdentifier: LOG_MY_DAY_PAGE_LAYOUT_TAB_UNIVERSAL_IDENTIFIER,
      title: 'Log my day',
      position: 0,
      icon: 'IconClockEdit',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: LOG_MY_DAY_PAGE_WIDGET_UNIVERSAL_IDENTIFIER,
          title: ' ',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              LOG_MY_DAY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
          },
        },
      ],
    },
  ],
});
