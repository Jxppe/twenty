import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  PRACTICE_AREAS_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  PRACTICE_AREAS_VIEW_UNIVERSAL_IDENTIFIER,
  SETUP_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: PRACTICE_AREAS_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Types of work',
  icon: 'IconScale',
  position: 1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: PRACTICE_AREAS_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    SETUP_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
});
