import styles from "./KnowledgeGap.module.css";

const SVG_WIDTH = 440;
const SVG_HEIGHT = 300;

const CENTER_X = SVG_WIDTH / 2;
const CENTER_Y = SVG_HEIGHT / 2;

/*
 * 雷达图最大半径。
 * value = 100 时到达该位置。
 */
const GRID_RADIUS = 88;

/*
 * 标签距离中心的位置。
 * 可以在 125～140 之间微调。
 */
const LABEL_RADIUS = 128;

const GRID_LEVELS = 5;

/**
 * 根据角度和半径计算 SVG 坐标。
 */
function getPoint(angle, radius) {
  return {
    x:
      CENTER_X +
      Math.cos(angle) * radius,

    y:
      CENTER_Y +
      Math.sin(angle) * radius,
  };
}

/**
 * 将坐标数组转换成 SVG polygon points。
 */
function pointsToString(points) {
  return points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
}

/**
 * 根据标签所在方向设置文字对齐方式。
 *
 * 右侧：文字向右展开
 * 左侧：文字向左展开
 * 上下：文字居中
 */
function getLabelAnchor(angle) {
  const cosine = Math.cos(angle);

  if (cosine > 0.35) {
    return "start";
  }

  if (cosine < -0.35) {
    return "end";
  }

  return "middle";
}

/**
 * 根据标签所在方向设置垂直位置。
 */
function getLabelBaseline(angle) {
  const sine = Math.sin(angle);

  if (sine < -0.7) {
    return "auto";
  }

  if (sine > 0.7) {
    return "hanging";
  }

  return "middle";
}

/**
 * 对标签坐标做少量调整，
 * 防止文字贴雷达图太近。
 */
function getLabelOffset(angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  let offsetX = 0;
  let offsetY = 0;

  if (cosine > 0.35) {
    offsetX = 6;
  } else if (cosine < -0.35) {
    offsetX = -6;
  }

  if (sine < -0.7) {
    offsetY = -4;
  } else if (sine > 0.7) {
    offsetY = 4;
  }

  return {
    offsetX,
    offsetY,
  };
}

export default function KnowledgeGap({
  data = [],
}) {
  const safeData = Array.isArray(data)
    ? data
        .filter((item) => item != null)
        .map((item, index) => ({
          label:
            item.label ||
            item.type ||
            `Knowledge ${index + 1}`,

          value: Math.max(
            0,
            Math.min(
              100,
              Number(item.value ?? 0)
            )
          ),
        }))
    : [];

  if (safeData.length === 0) {
    return (
      <div className={styles.knowledgeCard}>
        <h2 className={styles.knowledgeTitle}>
          Knowledge Gap Analysis
        </h2>

        <div className={styles.emptyState}>
          No knowledge gap data available.
        </div>
      </div>
    );
  }

  const itemCount = safeData.length;

  /**
   * 根据知识点数量平均分配角度。
   *
   * 第一个知识点固定从顶部开始。
   */
  const getAngle = (index) =>
    -Math.PI / 2 +
    index * ((Math.PI * 2) / itemCount);

  /**
   * 创建五层雷达图背景。
   *
   * 每层分别代表：
   * 20%、40%、60%、80%、100%
   */
  const gridPolygons = Array.from(
    {
      length: GRID_LEVELS,
    },
    (_, levelIndex) => {
      const radius =
        GRID_RADIUS *
        ((levelIndex + 1) / GRID_LEVELS);

      const points = safeData.map(
        (_, index) =>
          getPoint(
            getAngle(index),
            radius
          )
      );

      return {
        key: `grid-${levelIndex}`,
        points: pointsToString(points),
      };
    }
  );

  /**
   * 创建中心到各知识点方向的轴线。
   */
  const axisLines = safeData.map(
    (item, index) => {
      const angle = getAngle(index);

      const endPoint = getPoint(
        angle,
        GRID_RADIUS
      );

      return {
        key: `axis-${item.label}-${index}`,
        x2: endPoint.x,
        y2: endPoint.y,
      };
    }
  );

  /**
   * 创建真实数据区域。
   *
   * 固定使用 0～100 标准比例：
   *
   * 25 → 最大半径的 25%
   * 50 → 最大半径的 50%
   * 75 → 最大半径的 75%
   * 100 → 填满雷达图
   */
  const dataPoints = safeData.map(
    (item, index) => {
      const displayRatio =
        item.value / 100;

      return getPoint(
        getAngle(index),
        GRID_RADIUS * displayRatio
      );
    }
  );

  const dataPolygon =
    pointsToString(dataPoints);

  /**
   * 创建标签。
   *
   * 标签根据方向分别向外展开，
   * 不会因为文字长度不同导致位置不对称。
   */
  const labels = safeData.map(
    (item, index) => {
      const angle = getAngle(index);

      const point = getPoint(
        angle,
        LABEL_RADIUS
      );

      const {
        offsetX,
        offsetY,
      } = getLabelOffset(angle);

      return {
        ...item,
        index,
        angle,

        x: point.x + offsetX,
        y: point.y + offsetY,

        textAnchor:
          getLabelAnchor(angle),

        dominantBaseline:
          getLabelBaseline(angle),
      };
    }
  );

  return (
    <div className={styles.knowledgeCard}>
      <h2 className={styles.knowledgeTitle}>
        Knowledge Gap Analysis
      </h2>

      <div className={styles.knowledgeContent}>
        <div className={styles.radarSection}>
          <svg
            className={styles.radarChart}
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            role="img"
            aria-label="Knowledge gap radar chart"
          >
            {/* 雷达图背景层 */}
            <g className={styles.gridGroup}>
              {gridPolygons.map(
                (polygon, index) => (
                  <polygon
                    key={polygon.key}
                    points={polygon.points}
                    className={
                      styles.gridPolygon
                    }
                    style={{
                      animationDelay:
                        `${index * 0.08}s`,
                    }}
                  />
                )
              )}
            </g>

            {/* 雷达图轴线 */}
            <g className={styles.axisGroup}>
              {axisLines.map((line) => (
                <line
                  key={line.key}
                  x1={CENTER_X}
                  y1={CENTER_Y}
                  x2={line.x2}
                  y2={line.y2}
                  className={
                    styles.axisLine
                  }
                />
              ))}
            </g>

            {/* 数据区域 */}
            <polygon
              points={dataPolygon}
              className={
                styles.dataPolygon
              }
            />

            {/* 数据节点 */}
            {dataPoints.map(
              (point, index) => (
                <circle
                  key={`point-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="3.5"
                  className={
                    styles.dataPoint
                  }
                />
              )
            )}

            {/* 知识点标签 */}
            {labels.map((item) => (
              <text
                key={`label-${item.label}-${item.index}`}
                x={item.x}
                y={item.y}
                textAnchor={
                  item.textAnchor
                }
                dominantBaseline={
                  item.dominantBaseline
                }
                className={
                  styles.radarLabel
                }
              >
                {item.label}
              </text>
            ))}
          </svg>
        </div>

        <div className={styles.gapDetails}>
          {safeData.map((item, index) => (
            <div
              className={styles.gapItem}
              key={`${item.label}-${index}`}
            >
              <div className={styles.gapHeader}>
                <span>{item.label}</span>

                <strong>
                  {Number.isInteger(
                    item.value
                  )
                    ? item.value
                    : item.value.toFixed(1)}
                  %
                </strong>
              </div>

              <div
                className={
                  styles.progressTrack
                }
              >
                <div
                  className={
                    styles.progressFill
                  }
                  style={{
                    "--target-width":
                      `${item.value}%`,

                    animationDelay:
                      `${index * 0.12}s`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}