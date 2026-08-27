import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  MONEY_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  QUOTATIONS_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  QUOTATIONS_OPEN_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: QUOTATIONS_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Awaiting an answer',
  icon: 'IconFileDollar',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: QUOTATIONS_OPEN_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: MONEY_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
});
