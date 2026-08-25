import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  DEADLINES_DUE_VIEW_UNIVERSAL_IDENTIFIER,
  DEADLINES_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  PRACTICE_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: DEADLINES_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Deadlines',
  icon: 'IconAlarm',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: DEADLINES_DUE_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    PRACTICE_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
});
