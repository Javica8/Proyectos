// js/roles.js
window.getCurrentUserRole = async function() {
    const user = await window.OnlineStoreAPI.getCurrentUser();
    return user ? user.role : null;
};
window.getCurrentUserId = async function() {
    const user = await window.OnlineStoreAPI.getCurrentUser();
    return user ? user.id : null;
};