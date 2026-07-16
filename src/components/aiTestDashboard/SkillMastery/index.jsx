import {
  useEffect,
  useState
} from 'react';

import styles from './skillMastery.module.css';


const SkillMastery = ({
  skills = [],
  layout = 'horizontal'
}) => {

  const [isLoaded, setIsLoaded] = useState(false);


  // ==========================================
  // 每次真实 Skill 数据更新时
  // 先将进度条归零，再播放滑动动画
  // ==========================================

  useEffect(() => {

    setIsLoaded(false);

    const timer = setTimeout(() => {

      setIsLoaded(true);

    }, 150);


    return () => {

      clearTimeout(timer);

    };

  }, [skills]);


  // ==========================================
  // 根据掌握度决定进度条颜色
  // ==========================================

  const getProgressColor = (masteryRate) => {

    if (masteryRate >= 80) {
      return 'green';
    }

    if (masteryRate >= 50) {
      return 'blue';
    }

    return 'orange';

  };


  // ==========================================
  // 没有 Skill 数据
  // ==========================================

  if (!skills || skills.length === 0) {

    return (

      <section
        className={`${styles.card} ${styles['skill-mastery']}`}
      >

        <h4 className={styles['skill-title']}>

          Skill Mastery

        </h4>


        <div
          style={{
            textAlign: 'center',
            padding: '30px',
            color: '#64748b'
          }}
        >

          No skill mastery data available yet.

        </div>

      </section>

    );

  }


  // ==========================================
  // Skill Mastery
  // ==========================================

  return (

    <section
      className={`${styles.card} ${styles['skill-mastery']}`}
    >

      <h4 className={styles['skill-title']}>

        Skill Mastery

      </h4>


      <div
        className={styles['skills-grid']}
        style={
          layout === 'vertical'
            ? {
                gridTemplateColumns: '1fr',
                gap: '20px'
              }
            : {}
        }
      >

        {skills.map((skill, index) => {

          const masteryRate = Math.min(
            Math.max(
              Number(skill.masteryRate || 0),
              0
            ),
            100
          );


          const progressColor =
            getProgressColor(masteryRate);


          return (

            <div
              className={styles['skill-item']}
              key={`${skill.topic}-${index}`}
            >

              {/* ==========================
                  Skill 名称和百分比
                 ========================== */}

              <div
                className={styles['skill-name']}
              >

                <span>

                  {skill.topic || 'General'}

                </span>


                <span
                  className={
                    styles['skill-percentage']
                  }
                >

                  {masteryRate.toFixed(1)}%

                </span>

              </div>


              {/* ==========================
                  动态进度条
                 ========================== */}

              <div className={styles['progress-bar']}>

                <div
                  className={`
                    ${styles['progress-fill']}
                    ${styles[progressColor]}
                  `}
                  style={{
                    width: isLoaded
                      ? `${masteryRate}%`
                      : '0%'
                  }}
                />

              </div>


              {/* ==========================
                  答题统计 / 维度说明
                 ========================== */}

              <div
                style={{
                  marginTop: '8px',
                  fontSize: '13px',
                  color: '#64748b'
                }}
              >

                {skill.subtitle
                  ? skill.subtitle
                  : skill.totalQuestions > 0
                    ? `${skill.correctQuestions || 0} correct out of ${skill.totalQuestions} questions`
                    : null
                }

              </div>

            </div>

          );

        })}

      </div>

    </section>

  );

};

export default SkillMastery;