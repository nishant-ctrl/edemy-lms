export const createAuthSlice = (set) => ({
    userInfo: undefined,
    currency:import.meta.env.VITE_CURRENCY,
    setUserInfo: (userInfo) => set({ userInfo }),
});
