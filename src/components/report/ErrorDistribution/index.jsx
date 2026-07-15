import styles from "./ErrorDistribution.module.css";

const colors = [
  "#ef5f8a",
  "#f6bf26",
  "#45a7e8",
  "#8b5cf6",
  "#22b8a7",
  "#f97316",
  "#6366f1",
  "#84cc16",
];

export default function ErrorDistribution({
  data = [],
}) {
  const safeData = Array.isArray(data)
    ? data.filter((item) => item != null)
    : [];

  if (safeData.length === 0) {
    return (
      <div
        className={`${styles.card} ${styles.errorCard}`}
      >
        <h2>Error Type Distribution</h2>

        <p>No error data available.</p>
      </div>
    );
  }

  const normalizedData = safeData.map(
    (item, index) => ({
      label:
        item.type ||
        item.label ||
        `Unknown Error ${index + 1}`,

      value: Math.max(
        0,
        Number(
          item.value ??
            item.percentage ??
            0
        )
      ),

      color:
        colors[index % colors.length],
    })
  );

  const totalValue = normalizedData.reduce(
    (total, item) =>
      total + item.value,
    0
  );

  let currentPercent = 0;

  const reportData = normalizedData.map(
    (item) => {
      const chartPercent =
        totalValue > 0
          ? (item.value / totalValue) * 100
          : 0;

      const start = currentPercent;
      const end =
        currentPercent + chartPercent;

      currentPercent = end;

      return {
        ...item,
        start,
        end,
      };
    }
  );

  const gradient = `conic-gradient(${reportData
    .map(
      (item) =>
        `${item.color} ${item.start}% ${item.end}%`
    )
    .join(", ")})`;

  /*
   * 根据错误类型数量动态计算卡片高度。
   *
   * 1～3 项：高度较短
   * 4～6 项：自动增加
   * 更多项目：继续向下扩展
   */
  const cardHeight = Math.max(
    380,
    285 + reportData.length * 43
  );

  return (
    <div
      className={`${styles.card} ${styles.errorCard}`}
      style={{
        height: `${cardHeight}px`,
      }}
    >
      <h2>Error Type Distribution</h2>

      <div className={styles.pieChart}>
        <div
          className={styles.pie}
          style={{
            background: gradient,
          }}
        ></div>
      </div>

      <div className={styles.errorList}>
        {reportData.map((item, index) => (
          <div
            className={styles.errorItem}
            key={`${item.label}-${index}`}
          >
            <div className={styles.errorName}>
              <span
                className={styles.errorDot}
                style={{
                  backgroundColor:
                    item.color,
                }}
              ></span>

              {item.label}
            </div>

            <strong>
              {Number.isInteger(item.value)
                ? item.value
                : item.value.toFixed(1)}
              %
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}