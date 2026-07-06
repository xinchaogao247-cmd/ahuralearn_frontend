import {
  BriefcaseBusiness,
  CalendarDays,
  Code2,
  GraduationCap,
  Mars,
  MapPin,
  UserRound,
  Venus,
  VenusAndMars,
} from "lucide-react";

import styles from "./LearningProfile.module.css";

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

function formatBirthday(value) {
  const isoDate = toDateInputValue(value);

  if (!isoDate) {
    return "";
  }

  return new Date(`${isoDate}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function calculateAgeFromBirthday(value) {
  const isoDate = toDateInputValue(value);

  if (!isoDate) {
    return "";
  }

  const birthday = new Date(`${isoDate}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthday.getDate())
  ) {
    age -= 1;
  }

  return String(age);
}

const genderOptions = ["Male", "Female", "Other"];

// icon + color per gender; unknown/legacy free-text values get the neutral one
const genderPresentations = {
  male: { Icon: Mars, tone: "blue" },
  female: { Icon: Venus, tone: "pink" },
};

function getGenderPresentation(value) {
  const normalized = String(value ?? "").trim().toLowerCase();

  return genderPresentations[normalized] ?? { Icon: VenusAndMars, tone: "purple" };
}

const summaryItems = [
  {
    key: "age",
    label: "AGE",
    Icon: UserRound,
    tone: "blue",
  },
  {
    key: "gender",
    label: "GENDER",
    Icon: Mars,
    tone: "pink",
  },
  {
    key: "region",
    label: "REGION",
    Icon: MapPin,
    tone: "blue",
  },
  {
    key: "birthday",
    label: "BIRTHDAY",
    Icon: CalendarDays,
    tone: "purple",
  },
];

const detailItems = [
  {
    key: "education",
    title: "Education",
    Icon: GraduationCap,
    tone: "purple",
    badge: "Completed",
  },
  {
    key: "occupation",
    title: "Occupation",
    Icon: BriefcaseBusiness,
    tone: "blue",
    badge: "Current",
  },
  {
    key: "skills",
    title: "Skills",
    Icon: Code2,
    tone: "green",
    badge: "12+ Skills",
  },
];

export default function LearningProfile({
  learningProfile,
  editing,
  onChange,
}) {
  const getFieldValue = (key) => {
    if (key === "age") {
      return calculateAgeFromBirthday(learningProfile.birthday);
    }

    if (key === "birthday") {
      return editing
        ? toDateInputValue(learningProfile.birthday)
        : formatBirthday(learningProfile.birthday);
    }

    if (key === "skills" && Array.isArray(learningProfile.skills)) {
      return learningProfile.skills.join(", ");
    }

    return String(learningProfile[key] ?? "");
  };

  const renderSummaryField = (key) => {
    if (!editing) {
      return <strong>{getFieldValue(key)}</strong>;
    }

    if (key === "age") {
      return <input value={getFieldValue(key)} readOnly aria-label="Age" />;
    }

    if (key === "birthday") {
      return (
        <input
          type="date"
          value={getFieldValue(key)}
          min="1900-01-01"
          max={getTodayIsoDate()}
          onChange={(event) => onChange(key, event.target.value)}
        />
      );
    }

    if (key === "gender") {
      const value = getFieldValue(key);

      return (
        <select
          value={genderOptions.includes(value) ? value : ""}
          onChange={(event) => onChange(key, event.target.value)}
          aria-label="Gender"
        >
          <option value="" disabled>
            Select gender
          </option>
          {genderOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        value={getFieldValue(key)}
        onChange={(event) => onChange(key, event.target.value)}
      />
    );
  };

  return (
    <section className={styles.profileInfoCard}>
      <div className={styles.basicInfo}>
        {summaryItems.map((item) => {
          const { key, label } = item;
          const { Icon, tone } =
            key === "gender" ? getGenderPresentation(learningProfile.gender) : item;

          return (
            <div className={styles.infoBox} key={key}>
              <span className={`${styles.iconBubble} ${styles[tone]}`}>
                <Icon size={18} strokeWidth={2.4} />
              </span>

              <div>
                <span className={styles.infoLabel}>{label}</span>
                {renderSummaryField(key)}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.detailList}>
        {detailItems.map(({ key, title, Icon, tone, badge }) => (
          <div className={styles.detailRow} key={key}>
            <span className={`${styles.detailIcon} ${styles[tone]}`}>
              <Icon size={23} strokeWidth={2.2} />
            </span>

            <div className={styles.detailContent}>
              <h3>{title}</h3>
              {editing ? (
                <textarea
                  value={getFieldValue(key)}
                  onChange={(event) => onChange(key, event.target.value)}
                />
              ) : (
                <p>{getFieldValue(key)}</p>
              )}
            </div>

            <span className={`${styles.badge} ${styles[tone]}`}>{badge}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
