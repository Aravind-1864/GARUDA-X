import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const STORAGE_KEY = 'garuda_x_history_v2';
const USER_KEY = 'garuda_x_user';
const USERS_LIST_KEY = 'garuda_x_users_list';
const SETTINGS_KEY = 'garuda_x_settings';

const MOCK_HISTORY = [];

const loadHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Could not load history from localStorage:', e);
  }
  return MOCK_HISTORY;
};

const saveHistory = (history) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Could not save history:', e);
  }
};

const loadUser = () => {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

const loadSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : {
      expertMode: false,
      notifications: true,
      dataPrivacy: 'standard',
    };
  } catch (e) {
    return { expertMode: false, notifications: true, dataPrivacy: 'standard' };
  }
};

const loadUsersList = () => {
  try {
    const stored = localStorage.getItem(USERS_LIST_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    if (parsed.length === 0) {
      return [{
        email: 'admin@garuda.com',
        password: 'password123',
        name: 'Admin Garuda',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        provider: 'Email'
      }];
    }
    return parsed;
  } catch (e) {
    return [];
  }
};

export const AppProvider = ({ children }) => {
  const [history, setHistory] = useState(loadHistory);
  const [currentResult, setCurrentResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [user, setUser] = useState(loadUser);
  const [usersList, setUsersList] = useState(loadUsersList);
  const [settings, setSettings] = useState(loadSettings);

  // Persist whenever state changes
  useEffect(() => { saveHistory(history); }, [history]);
  useEffect(() => { localStorage.setItem(USER_KEY, JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem(USERS_LIST_KEY, JSON.stringify(usersList)); }, [usersList]);
  useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);

  const login = (userData) => {
    setUser(userData);
  };

  const register = (userData) => {
    setUsersList(prev => [...prev.filter(u => u.email !== userData.email), userData]);
    setUser(userData);
  };

  const validateUser = (email, password) => {
    const found = usersList.find(u => u.email === email && u.password === password);
    return found || null;
  };

  const logout = () => {
    setUser(null);
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateProfile = (profileData) => {
    setUser(prev => prev ? { ...prev, ...profileData } : null);
  };

  const addToHistory = (result) => {
    const newEntry = {
      ...result,
      id: result.id || Date.now(),
      date: result.date || new Date().toISOString().split('T')[0],
      timestamp: result.timestamp || new Date().toISOString(),
    };
    setHistory(prev => [newEntry, ...prev]);
  };

  const removeFromHistory = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const getStats = () => {
    const total = history.length;
    const genuine = history.filter(h => h.risk === 'genuine').length;
    const suspicious = history.filter(h => h.risk === 'suspicious').length;
    const fake = history.filter(h => h.risk === 'fake').length;
    const avgScore = total > 0
      ? Math.round(history.reduce((acc, h) => acc + (h.score || 0), 0) / total)
      : 0;
    return { total, genuine, suspicious, fake, avgScore };
  };

  return (
    <AppContext.Provider value={{
      history,
      currentResult,
      setCurrentResult,
      isAnalyzing,
      setIsAnalyzing,
      addToHistory,
      removeFromHistory,
      clearHistory,
      getStats,
      user,
      login,
      logout,
      register,
      validateUser,
      settings,
      updateSettings,
      updateProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
