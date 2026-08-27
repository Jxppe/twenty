import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

import { MONEY_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineNavigationMenuItem({
  universalIdentifier: MONEY_FOLDER_NAV_ITEM_UNIVERSAL_IDENTIFIER,
  name: 'Money',
  icon: 'IconCoin',
  position: 3,
  type: NavigationMenuItemType.FOLDER,
});
