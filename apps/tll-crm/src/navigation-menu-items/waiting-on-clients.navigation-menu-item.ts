import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  OUTSTANDING_DOCUMENTS_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  OUTSTANDING_DOCUMENTS_VIEW_UNIVERSAL_IDENTIFIER,
  PRACTICE_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: OUTSTANDING_DOCUMENTS_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Waiting on clients',
  icon: 'IconFileDescription',
  position: 2,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: OUTSTANDING_DOCUMENTS_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    PRACTICE_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
});
