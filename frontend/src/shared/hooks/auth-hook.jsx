import { useCallback, useState, useEffect } from 'react';

let logoutTimer;

export const useAuth = () => {
  const [token, setToken] = useState();
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [userId, setUserId] = useState();

  const login = useCallback((userId, token, expirationDate) => {
    setToken(token);
    setUserId(userId);
    // 시차
    const offset = new Date().getTimezoneOffset() * 60000;
    // 토큰 만료 기한
    const tokenExpirationDate =
      expirationDate ||
      new Date(new Date().getTime() + 1000 * 60 * 60 - offset);
    setTokenExpirationDate(tokenExpirationDate);
    window.localStorage.setItem(
      'userData',
      JSON.stringify({
        userId,
        token,
        expiration: tokenExpirationDate.toISOString(),
      })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpirationDate(null);
    setUserId(null);
    window.localStorage.removeItem('userData');
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      // 토큰 기한에 따른 자동 로그아웃
      const remainingTime = tokenExpirationDate.getTime() - new Date();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      // 수동 로그아웃
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  // 새로고침 시 다시 로그인 되게하는 로직
  useEffect(() => {
    const storedData = JSON.parse(window.localStorage.getItem('userData'));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(
        storedData.userId,
        storedData.token,
        new Date(storedData.expiration)
      );
    }
  }, [login]);

  return { token, login, logout, userId };
};
