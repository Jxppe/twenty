import {
  definePageLayoutTab,
  PageLayoutTabLayoutMode,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  PERSON_CONVERSATIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  PERSON_CONVERSATIONS_TAB_UNIVERSAL_IDENTIFIER,
  PERSON_CONVERSATIONS_WIDGET_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default definePageLayoutTab({
  universalIdentifier: PERSON_CONVERSATIONS_TAB_UNIVERSAL_IDENTIFIER,
  pageLayoutUniversalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage
      .universalIdentifier,
  title: 'Conversations',
  position: 1000,
  icon: 'IconMessages',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [
    {
      universalIdentifier: PERSON_CONVERSATIONS_WIDGET_UNIVERSAL_IDENTIFIER,
      title: 'Conversations',
      type: 'FRONT_COMPONENT',
      configuration: {
        configurationType: 'FRONT_COMPONENT',
        frontComponentUniversalIdentifier:
          PERSON_CONVERSATIONS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    },
  ],
});
