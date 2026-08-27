import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  MONEY_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  PAYMENTS_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  PAYMENTS_RECENT_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: PAYMENTS_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Payments received',
  icon: 'IconCashBanknote',
  position: 2,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: PAYMENTS_RECENT_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: MONEY_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
});
