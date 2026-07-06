import { useState } from "react";
import { Check, Pencil, Share2, X } from "lucide-react";

import { showToast } from "../../common/toast";
import styles from "./ProfileCard.module.css";

const fallbackAvatar = "https://i.pravatar.cc/150?img=47";

function getTopNavAvatar(profileAvatar) {
  const storedUser = localStorage.getItem("userInfo");

  if (!storedUser) {
    return profileAvatar || fallbackAvatar;
  }

  try {
    const userInfo = JSON.parse(storedUser);

    return userInfo.avatar || profileAvatar || fallbackAvatar;
  } catch (error) {
    console.warn("Failed to parse stored user info", error);
    return profileAvatar || fallbackAvatar;
  }
}

export default function ProfileCard({
  profile,
  editing,
  onCancel,
  onChange,
  onEdit,
  onSave,
}) {
  const [avatarSrc, setAvatarSrc] = useState(() =>
    getTopNavAvatar(profile.avatar)
  );
  const [shareLabel, setShareLabel] = useState("Share Profile");

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      showToast("Please choose a valid image file.", "warning");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const nextAvatar = reader.result;
      const storedUser = localStorage.getItem("userInfo");

      setAvatarSrc(nextAvatar);

      if (storedUser) {
        try {
          const userInfo = JSON.parse(storedUser);

          localStorage.setItem(
            "userInfo",
            JSON.stringify({
              ...userInfo,
              avatar: nextAvatar,
            })
          );
        } catch (error) {
          console.warn("Failed to update stored avatar", error);
          showToast("Avatar changed, but local profile sync failed.", "warning");
        }
      }

      showToast("Avatar updated successfully.", "success");
    };

    reader.onerror = () => {
      showToast("Could not read the selected image.", "error");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleShare = async () => {
    const shareData = {
      title: profile.name,
      text: `${profile.name} - ${profile.role}. ${profile.description}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareLabel("Shared");
        showToast("Profile shared successfully.", "success");
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          `${shareData.text} ${shareData.url}`
        );
        setShareLabel("Copied Link");
        showToast("Profile link copied.", "success");
      } else {
        const textArea = document.createElement("textarea");

        textArea.value = `${shareData.text} ${shareData.url}`;
        textArea.setAttribute("readonly", "");
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setShareLabel("Copied Link");
        showToast("Profile link copied.", "success");
      }

      window.setTimeout(() => {
        setShareLabel("Share Profile");
      }, 1800);
    } catch (error) {
      if (error.name !== "AbortError") {
        setShareLabel("Share Failed");
        showToast("Could not share profile.", "error");
        window.setTimeout(() => {
          setShareLabel("Share Profile");
        }, 1800);
      }
    }
  };

  return (
    <section className={styles.profileCard}>
      <label className={styles.avatarWrap} title="Change avatar">
        <img
          src={avatarSrc}
          alt={profile.name}
          onError={() => setAvatarSrc(fallbackAvatar)}
        />
        <span className={styles.avatarOverlay}>Change</span>
        <input
          type="file"
          accept="image/*"
          className={styles.avatarInput}
          onChange={handleAvatarChange}
        />
      </label>

      {editing ? (
        <div className={styles.editForm}>
          <label>
            Name
            <input
              value={profile.name}
              onChange={(event) => onChange("name", event.target.value)}
            />
          </label>

          <label>
            Role
            <input
              value={profile.role}
              onChange={(event) => onChange("role", event.target.value)}
            />
          </label>

          <label>
            Bio
            <textarea
              rows="4"
              value={profile.description}
              onChange={(event) =>
                onChange("description", event.target.value)
              }
            />
          </label>
        </div>
      ) : (
        <>
          <h1>{profile.name}</h1>
          <p className={styles.role}>{profile.role}</p>
          <p className={styles.description}>{profile.description}</p>
        </>
      )}

      <div className={styles.profileActions}>
        {editing ? (
          <>
            <button
              className={`${styles.actionButton} ${styles.saveButton}`}
              type="button"
              onClick={onSave}
            >
              <Check size={18} strokeWidth={2.3} />
              <span>Save Profile</span>
            </button>

            <button
              className={styles.actionButton}
              type="button"
              onClick={onCancel}
            >
              <X size={18} strokeWidth={2.3} />
              <span>Cancel</span>
            </button>
          </>
        ) : (
          <button
            className={styles.actionButton}
            type="button"
            onClick={onEdit}
          >
            <Pencil size={18} strokeWidth={2.3} />
            <span>Edit Profile</span>
          </button>
        )}

        <button
          className={styles.actionButton}
          type="button"
          onClick={handleShare}
        >
          <Share2 size={18} strokeWidth={2.3} />
          <span>{shareLabel}</span>
        </button>
      </div>
    </section>
  );
}
