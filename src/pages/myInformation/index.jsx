import { useEffect, useState } from "react";

import styles from "./MyInformation.module.css";

import PageShell from "../../components/profileLayout/PageShell";
import { getMyInformationPageData, updateProfile } from "../../api/user/user";
import { showToast } from "../../components/common/toast";

import ProfileCard from "../../components/myInformation/ProfileCard";
import LearningProfile from "../../components/myInformation/LearningProfile";

function getTodayIsoDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function toDateInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function isValidBirthday(value) {
  const isoDate = toDateInputValue(value);

  if (!isoDate) {
    return false;
  }

  return isoDate <= getTodayIsoDate();
}

function isBlankValue(value) {
  const normalizedValue = String(value ?? "").trim().toLowerCase();

  return (
    !normalizedValue ||
    normalizedValue === "null" ||
    normalizedValue === "undefined"
  );
}

function hasEmptyProfileField(data) {
  const profileFields = ["name", "role", "description"];
  const learningProfileFields = [
    "gender",
    "region",
    "birthday",
    "education",
    "occupation",
    "skills",
  ];

  return (
    profileFields.some((field) => isBlankValue(data.profile[field])) ||
    learningProfileFields.some((field) => isBlankValue(data.learningProfile[field]))
  );
}

function normalizeSkills(skills) {
  if (Array.isArray(skills)) {
    return skills.map((skill) => String(skill).trim()).filter(Boolean);
  }

  return String(skills ?? "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export default function MyInformation() {
  const [data, setData] = useState(null);
  const [draftData, setDraftData] = useState(null);
  const [editing, setEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadMyInformationData() {
      try {
        setLoading(true);

        const result = await getMyInformationPageData();

        if (!ignore) {
          setData(result);
          setDraftData(result);
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadMyInformationData();

    return () => {
      ignore = true;
    };
  }, []);

  const handleEdit = () => {
    setDraftData(data);
    setEditing(true);
  };

  const handleCancel = () => {
    setDraftData(data);
    setEditing(false);
  };

  const handleSave = async () => {
    if (hasEmptyProfileField(draftData)) {
      showToast("Please complete all profile fields before saving.", "warning");
      return;
    }

    if (!isValidBirthday(draftData.learningProfile.birthday)) {
      showToast("Please choose a valid birthday that is not in the future.", "warning");
      return;
    }

    const normalizedBirthday = toDateInputValue(draftData.learningProfile.birthday);

    const nextData = {
      profile: {
        ...draftData.profile,
        name: draftData.profile.name.trim(),
        role: draftData.profile.role.trim(),
        description: draftData.profile.description.trim(),
      },
      learningProfile: {
        ...draftData.learningProfile,
        gender: draftData.learningProfile.gender.trim(),
        region: draftData.learningProfile.region.trim(),
        birthday: normalizedBirthday,
        education: draftData.learningProfile.education.trim(),
        occupation: draftData.learningProfile.occupation.trim(),
        skills: normalizeSkills(draftData.learningProfile.skills),
      },
    };

    try {
      await updateProfile(nextData);
    } catch (error) {
      console.error("Failed to save profile", error);
      showToast("Failed to save profile. Please try again.", "error");
      return;
    }

    const storedUser = localStorage.getItem("userInfo");

    if (storedUser) {
      try {
        const userInfo = JSON.parse(storedUser);

        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            ...userInfo,
            username: nextData.profile.name,
          })
        );
      } catch (error) {
        console.warn("Failed to update stored user info", error);
        showToast("Profile saved, but local account sync failed.", "warning");
      }
    }

    setData(nextData);
    setDraftData(nextData);
    setEditing(false);
    showToast("Profile updated successfully.", "success");
  };

  const handleProfileChange = (field, value) => {
    setDraftData((currentData) => ({
      ...currentData,
      profile: {
        ...currentData.profile,
        [field]: value,
      },
    }));
  };

  const handleLearningProfileChange = (field, value) => {
    setDraftData((currentData) => ({
      ...currentData,
      learningProfile: {
        ...currentData.learningProfile,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <PageShell>
        <main className={`${styles.myInformationPage} ${styles.pageStatus}`}>
          Loading...
        </main>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <main className={`${styles.myInformationPage} ${styles.pageStatus}`}>
          Failed to load profile data.
        </main>
      </PageShell>
    );
  }

  if (!data || !draftData) {
    return (
      <PageShell>
        <main className={`${styles.myInformationPage} ${styles.pageStatus}`}>
          No profile data found.
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className={styles.myInformationPage}>
        <div className={styles.profileContainer}>
          <ProfileCard
            profile={editing ? draftData.profile : data.profile}
            editing={editing}
            onCancel={handleCancel}
            onChange={handleProfileChange}
            onEdit={handleEdit}
            onSave={handleSave}
          />

          <LearningProfile
            learningProfile={
              editing ? draftData.learningProfile : data.learningProfile
            }
            editing={editing}
            onChange={handleLearningProfileChange}
          />
        </div>
      </main>
    </PageShell>
  );
}
