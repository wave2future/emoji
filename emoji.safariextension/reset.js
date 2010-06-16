function reset(e) {
    safari.self.tab.dispatchMessage("updateBadgeCount", 0);
}

// FIXME: still have some bugs on reseting badgeCount
window.addEventListener("blur", reset, false);
window.addEventListener("close", reset, false);
