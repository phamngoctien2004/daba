// Copy và paste vào Browser Console để test notification system

// 1. Kiểm tra WebSocket connection
console.log('=== WEBSOCKET STATUS ===');
console.log('Connected:', window.wsClient?.isConnected());

// 2. Kiểm tra User ID
console.log('\n=== USER INFO ===');
const authStore = JSON.parse(localStorage.getItem('auth-storage') || '{}');
console.log('User ID:', authStore.state?.user?.id);
console.log('User email:', authStore.state?.user?.email);

// 3. Kiểm tra subscriptions
console.log('\n=== SUBSCRIPTIONS ===');
console.log('Topic subscriptions:', window.wsClient?.subscriptions?.size);

// 4. Kiểm tra React Query cache
console.log('\n=== REACT QUERY CACHE ===');
const notificationData = window.queryClient?.getQueryData(['notifications']);
console.log('Notification data:', notificationData);
console.log('Unread count:', notificationData?.data?.unreadCount);

// 5. Force refetch notifications
console.log('\n=== FORCE REFETCH ===');
window.queryClient?.refetchQueries({ queryKey: ['notifications'] })
    .then(() => {
        const updated = window.queryClient?.getQueryData(['notifications']);
        console.log('✅ Refetch completed');
        console.log('Updated unread count:', updated?.data?.unreadCount);
    });

// 6. Test notification manually (simulate WebSocket)
console.log('\n=== MANUAL TEST ===');
console.log('To manually trigger notification:');
console.log(`
window.queryClient?.invalidateQueries({ 
  queryKey: ['notifications'],
  refetchType: 'active'
});
window.queryClient?.refetchQueries({
  queryKey: ['notifications'],
  type: 'active'
});
`);
