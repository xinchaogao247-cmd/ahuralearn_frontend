import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import { logoutAccount, getSimpleInfo } from '../../../api/user/user';
import styles from './TopNav.module.css';

import logoImage from '../../../assets/images/logo.png';

import { getNotificationsData } from "../../../api/notification/notifications";
import { showToast } from '../toast';
const notificationsUpdatedEvent = "notifications-updated";
const notificationStateKey = "__ahuralearnNotificationState";

function getNotificationState() {
  if (!window[notificationStateKey]) {
    window[notificationStateKey] = {
      acknowledgedPlanIds: [],
      deletedPlanIds: [],
    };
  }

  return window[notificationStateKey];
}

// GXC: Previous version counted unread notifications with local acknowledged/deleted state.
// function getUnreadNotificationCount(plans = []) {
//   const { acknowledgedPlanIds, deletedPlanIds } = getNotificationState();
//
//   return plans.filter(
//     (plan) =>
//       !acknowledgedPlanIds.includes(plan.id) && !deletedPlanIds.includes(plan.id)
//   ).length;
// }

// GXC: Normalize notification response fields used by different backend versions.
function getNotificationPlans(data) {
  const safeData = data ?? {};

  if (Array.isArray(data)) {
    return data;
  }

  return safeData.expiringPlans ?? safeData.records ?? safeData.list ?? [];
}

function getUnreadNotificationCount(plans = []) {
  return plans.filter((plan) => !plan.isAcknowledged).length;
}

export default function TopNav() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState('');

  const [notificationCount, setNotificationCount] = useState(0);

  const [userInfo, setUserInfo] = useState({});

  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const hideTimeoutRef = React.useRef(null);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsDropdownVisible(false);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {

    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser));
      } catch (err) {
        console.warn("Failed to parse stored user info", err);
      }
    }

    const fetchUserInfo = async () => {
      try {
        const response = await getSimpleInfo();
        const fetchedUser = response;
        if (fetchedUser) {
          const updatedUser = {
            ...fetchedUser,
            avatar: fetchedUser.avatar || 'https://ahuralearn.oss-ap-southeast-3.aliyuncs.com/user/avatar/defaultAvatar.jpg'
          };
          setUserInfo(updatedUser);
          localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        }
      } catch (error) {
        showToast('Failed to load user info, using default data.', 'error');
        if (!storedUser) {
          setUserInfo({
            username: 'Guest',
            email: 'guest@example.com',
            enrolledCourses: 0,
            avatar: 'https://ahuralearn.oss-ap-southeast-3.aliyuncs.com/user/avatar/defaultAvatar.jpg'
          });
        }
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    let ignore = false;

    const updateNotificationCount = async () => {
      try {
        const notificationsData = await getNotificationsData();
        // GXC: Use normalized notification list so all backend response shapes update the badge.
        const notificationPlans = getNotificationPlans(notificationsData);

        if (!ignore) {
          setNotificationCount(
            getUnreadNotificationCount(notificationPlans)
          );
        }
      } catch (err) {
        if (!ignore) {
          console.warn("Failed to load notification count", err);
        }
      }
    };

    updateNotificationCount();

    window.addEventListener(notificationsUpdatedEvent, updateNotificationCount);
    window.addEventListener("storage", updateNotificationCount);

    return () => {
      ignore = true;
      window.removeEventListener(
        notificationsUpdatedEvent,
        updateNotificationCount
      );
      window.removeEventListener("storage", updateNotificationCount);
    };
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      navigate(`/search?keyword=${encodeURIComponent(searchKeyword)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAccount();
      showToast('Logout successful', "success");
    } catch (err) {
      showToast('Logout failed', "error");
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userInfo');

      navigate('/login');
    }
  };

  return (
    <div className={styles.topNavContainer}>
      <div className={styles.navLeft}>
        <div className={styles.logoArea}>
          <img src={logoImage} alt="AhuraLearn Logo" className={styles.logoIcon} />
          <h1 className={styles.logoTitle}>AhuraLearn</h1>
        </div>

        <div className={styles.navHomepage}>
          <Link to="/homepage" className={styles.navLinkItem}>Homepage</Link>
        </div>
      </div>

      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} onClick={handleSearch} />
        <input
          type="text"
          placeholder="What do you want to learn?"
          className={styles.searchInput}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      <div className={styles.navRight}>
        <div className={styles.navExtraLinks}>
          <Link to="/featureHub" className={`${styles.navLinkItem} ${styles.navLearnWithAI}`}>Learn with AI</Link>
          <Link to="/dashboard" className={styles.navLinkItem}>My Profile</Link>
        </div>

        <div className={styles.navRightIcons}>
          <Link
            to="/notifications"
            className={styles.notificationIconWrapper}
            aria-label="View notifications"
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className={styles.notificationBadge}>
                {notificationCount}
              </span>
            )}
          </Link>

          <div
            className={styles.avatarWrapper}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <img src={userInfo.avatar} alt="User Avatar" className={styles.avatarImage} />

            <div className={`${styles.profileDropdownMenu} ${isDropdownVisible ? styles.dropdownVisible : ''}`}>
              <div className={styles.dropdownUserInfo}>
                <h3 className={styles.dropdownUsername}>{userInfo.username}</h3>
                <p className={styles.dropdownEmail}>{userInfo.email}</p>
                <p className={styles.dropdownEnrolled}>Enrolled Courses: {userInfo.enrolledCourses}</p>
              </div>
              <button className={styles.logoutButton} onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
