function reset(e) {
    safari.self.tab.dispatchMessage("resetBadgeCount", null);
}

// FIXME: still have some bugs on reseting badgeCount
window.addEventListener("blur", reset, false);
window.addEventListener("close", reset, false);
