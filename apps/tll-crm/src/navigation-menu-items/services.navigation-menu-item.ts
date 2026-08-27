import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  MONEY_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  PRODUCTS_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  PRODUCTS_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: PRODUCTS_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Price list',
  icon: 'IconTag',
  position: 3,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: PRODUCTS_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: MONEY_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
});
