import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  MONEY_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  INVOICES_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  INVOICES_UNPAID_VIEW_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: INVOICES_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Unpaid invoices',
  icon: 'IconReceipt',
  position: 1,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: INVOICES_UNPAID_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier: MONEY_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
});
