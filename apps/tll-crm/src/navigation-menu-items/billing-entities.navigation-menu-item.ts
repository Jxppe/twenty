import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import {
  BILLING_ENTITIES_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  BILLING_ENTITIES_VIEW_UNIVERSAL_IDENTIFIER,
  SETUP_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: BILLING_ENTITIES_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Billing entities',
  icon: 'IconBuildingBank',
  position: 0,
  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: BILLING_ENTITIES_VIEW_UNIVERSAL_IDENTIFIER,
  folderUniversalIdentifier:
    SETUP_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
});
