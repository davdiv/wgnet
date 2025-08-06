import { createPopupLogic } from "../generic/popupLogic";
import { createListNavigation } from "../lists/listNavigation";

const { closePopup, showPopup$, openerDirective, hasFocusDirective, stopForceClose } = createPopupLogic();
const navDirective = createListNavigation("a,button", closePopup);

export { closePopup, showPopup$, openerDirective, hasFocusDirective, stopForceClose, navDirective };
