import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const API_BASE = 'https://student-achievement-api.onrender.com';
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [userList, setUserList] = useState([]);
  const [achievementList, setAchievementList] = useState([]);
  const [myAchievementList, setMyAchievementList] = useState([]);
  const [participationList, setParticipationList] = useState([]);
  const [activityList, setActivityList] = useState([]);
  const [enrollmentList, setEnrollmentList] = useState([]);
  const [accessSummary, setAccessSummary] = useState(null);
  const [testAttemptList, setTestAttemptList] = useState([]);
  const [certificateList, setCertificateList] = useState([]);
  const [adminTestAttempts, setAdminTestAttempts] = useState([]);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);

  useEffect(() => {
    if (currentUser?.token) {
      loadPlatformData();
    }
  }, [currentUser?.token]); // eslint-disable-line

  useEffect(() => {
    if (currentUser) {
      const serializedUser = JSON.stringify(currentUser);
      if (currentUser.rememberMe) {
        localStorage.setItem('user', serializedUser);
        localStorage.setItem('currentUser', serializedUser);
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('currentUser');
      } else {
        sessionStorage.setItem('user', serializedUser);
        sessionStorage.setItem('currentUser', serializedUser);
        localStorage.removeItem('user');
        localStorage.removeItem('currentUser');
      }
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('currentUser');
      setUserList([]);
      setAchievementList([]);
      setMyAchievementList([]);
      setParticipationList([]);
      setActivityList([]);
      setEnrollmentList([]);
      setAccessSummary(null);
      setTestAttemptList([]);
      setCertificateList([]);
      setAdminTestAttempts([]);
      setLastRefreshedAt(null);
    }
  }, [currentUser]);

  const fetchJson = useCallback(async (path, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {}),
      ...(options.headers || {})
    };

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const message = typeof data === 'string' ? data : data.message || 'Request failed';
      if (response.status === 401) {
        setCurrentUser(null);
      }
      throw new Error(message);
    }

    return data;
  }, [currentUser?.token]);

  const loadPlatformData = useCallback(async () => {
    if (!currentUser?.token) return;

    try {
      if (currentUser.role === 'student') {
        const results = await Promise.allSettled([
          fetchJson('/activities'),
          fetchJson('/participations/me'),
          fetchJson('/test-attempts/me'),
          fetchJson('/certificates/me'),
          fetchJson(`/achievements/user/${currentUser.id}`)
        ]);

        const [activitiesResult, participationsResult, testAttemptsResult, certificatesResult, achievementsResult] = results;
        setActivityList(activitiesResult.status === 'fulfilled' ? activitiesResult.value || [] : []);
        setParticipationList(participationsResult.status === 'fulfilled' ? participationsResult.value || [] : []);
        setTestAttemptList(testAttemptsResult.status === 'fulfilled' ? testAttemptsResult.value || [] : []);
        setCertificateList(certificatesResult.status === 'fulfilled' ? certificatesResult.value || [] : []);
        setMyAchievementList(achievementsResult.status === 'fulfilled' ? achievementsResult.value || [] : []);
        setUserList([]);
        setAchievementList([]);
        setEnrollmentList([]);
        setAccessSummary(null);
        setAdminTestAttempts([]);
        setLastRefreshedAt(new Date().toISOString());
        return;
      }

      const requests = [
        fetchJson('/students'),
        fetchJson('/achievements'),
        fetchJson('/activities'),
        fetchJson('/enrollments'),
        fetchJson('/participations'),
        fetchJson('/admin/test-attempts')
      ];

      if (currentUser.role === 'admin') {
        requests.push(fetchJson('/admin/access-summary'));
      }

      const results = await Promise.allSettled(requests);
      const [studentsResult, achievementsResult, activitiesResult, enrollmentsResult, participationsResult, testAttemptsResult, summaryResult] = results;
      setUserList(studentsResult?.status === 'fulfilled' ? studentsResult.value || [] : []);
      setAchievementList(achievementsResult?.status === 'fulfilled' ? achievementsResult.value || [] : []);
      setMyAchievementList([]);
      setActivityList(activitiesResult?.status === 'fulfilled' ? activitiesResult.value || [] : []);
      setEnrollmentList(enrollmentsResult?.status === 'fulfilled' ? enrollmentsResult.value || [] : []);
      setParticipationList(participationsResult?.status === 'fulfilled' ? participationsResult.value || [] : []);
      setAdminTestAttempts(testAttemptsResult?.status === 'fulfilled' ? testAttemptsResult.value || [] : []);
      setAccessSummary(summaryResult?.status === 'fulfilled' ? summaryResult.value || null : null);
      setTestAttemptList([]);
      setCertificateList([]);
      setLastRefreshedAt(new Date().toISOString());
    } catch (error) {
      console.error('Failed to load platform data', error);
      throw error;
    }
  }, [currentUser?.id, currentUser?.role, currentUser?.token, fetchJson]);

  const addAchievement = async (achievement) => {
    await fetchJson('/achievements', {
      method: 'POST',
      body: JSON.stringify(achievement)
    });
    if (currentUser?.role === 'admin' || currentUser?.role === 'co-admin') {
      try {
        const latestAchievements = await fetchJson('/achievements');
        setAchievementList(latestAchievements || []);
      } catch (error) {
        await loadPlatformData();
      }
      return;
    }
    await loadPlatformData();
  };

  const addEnrollment = async (enrollment) => {
    await fetchJson('/enrollments', {
      method: 'POST',
      body: JSON.stringify({
        studentId: enrollment.studentId,
        activityId: enrollment.activityId
      })
    });
    await loadPlatformData();
  };

  const addActivity = async (activity) => {
    await fetchJson('/activities', {
      method: 'POST',
      body: JSON.stringify({
        activityName: activity.activityName,
        activityCategory: activity.activityCategory,
        domainId: Number(activity.domainId),
        role: activity.role,
        duration: activity.duration,
        skills: Array.isArray(activity.skills) ? activity.skills.join(', ') : activity.skills,
        startDate: activity.startDate,
        endDate: activity.endDate,
        slots: Number(activity.slots)
      })
    });
    await loadPlatformData();
  };

  const updateActivitySlots = async (activityId, slots) => {
    await fetchJson('/admin/activity-slots', {
      method: 'POST',
      body: JSON.stringify({ activityId, slots: Number(slots) })
    });
    await loadPlatformData();
  };

  const grantTestAccess = async (enrollmentId) => {
    await fetchJson('/admin/enrollments/grant-test-access', {
      method: 'POST',
      body: JSON.stringify({ enrollmentId })
    });
    await loadPlatformData();
  };

  const updatePlatformLimits = async (studentLimit, coAdminLimit) => {
    await fetchJson('/admin/limits', {
      method: 'POST',
      body: JSON.stringify({ studentLimit: Number(studentLimit), coAdminLimit: Number(coAdminLimit) })
    });
    await loadPlatformData();
  };

  const approveCoAdmin = async (userId) => {
    await fetchJson('/admin/approve-coadmin', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
    await loadPlatformData();
  };

  const removeUser = async (userId) => {
    await fetchJson('/admin/remove-user', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
    await loadPlatformData();
  };

  const issueAchievementForAttempt = async (payload) => {
    await fetchJson('/admin/test-attempts/issue-achievement', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    await loadPlatformData();
  };

  const logout = async () => {
    try {
      if (currentUser?.token) {
        await fetchJson('/auth/logout', { method: 'POST' });
      }
    } catch (error) {
      console.error('Logout warning', error);
    } finally {
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    setCurrentUser,
    students: userList,
    achievementList,
    myAchievementList,
    participationList,
    addAchievement,
    enrollmentList,
    addEnrollment,
    activityList,
    addActivity,
    accessSummary,
    testAttemptList,
    certificateList,
    adminTestAttempts,
    lastRefreshedAt,
    updateActivitySlots,
    grantTestAccess,
    updatePlatformLimits,
    approveCoAdmin,
    removeUser,
    issueAchievementForAttempt,
    refreshPlatformData: loadPlatformData,
    fetchJson,
    logout
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

