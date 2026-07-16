import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import TopNav from '../../components/common/TopNav';
import Footer from '../../components/common/Footer';

import AdaptiveTestBar from '../../components/aiTestDashboard/AdaptiveTestBar';
import AssessmentSummary from '../../components/aiTestDashboard/AssessmentSummary';
import SkillMastery from '../../components/aiTestDashboard/SkillMastery';

import styles from './aiTestDashboard.module.css';

import {
  getDashboardSummary,
  getAvailableCourses
} from '../../api/exam/exam';


const aiTestDashboard = () => {

  const navigate = useNavigate();

  // ==============================
  // Dashboard 数据
  // ==============================

  const [dashboardData, setDashboardData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [hasHistory, setHasHistory] = useState(false);


  // ==============================
  // 课程选择弹窗
  // ==============================

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [courses, setCourses] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState('');

  const [isLoadingCourses, setIsLoadingCourses] = useState(false);


  // ==============================
  // 获取 Dashboard 数据
  // ==============================

  useEffect(() => {

    const fetchDashboardData = async () => {

      try {

        setIsLoading(true);

        const dashboard =
          await getDashboardSummary();

        console.log(
          '====== Dashboard API ======',
          dashboard
        );

        if (
          !dashboard ||
          dashboard.totalAttempts === 0
        ) {

          setDashboardData(null);

          setHasHistory(false);

          return;
        }

        setDashboardData(dashboard);

        setHasHistory(true);

      } catch (error) {

        console.error(
          'Failed to load Dashboard:',
          error
        );

        setDashboardData(null);

        setHasHistory(false);

      } finally {

        setIsLoading(false);

      }

    };

    fetchDashboardData();

  }, []);


  // ==============================
  // 打开课程选择弹窗
  // ==============================

  const handleOpenTestModal = async () => {
    // Show a loading indicator on the button or just wait
    // We can just await the fetch first before opening the modal
    try {
      const response = await getAvailableCourses();
      const courseList = Array.isArray(response) ? response : response?.data || [];
      
      if (courseList.length === 0) {
        alert("Oops! You haven't enrolled in any courses yet. Please go to the Course section and enroll in a course before taking a test.");
        return;
      }
      
      setCourses(courseList);
      setSelectedCourse(courseList[0].id);
      setIsModalOpen(true);
      
    } catch (error) {
      console.error('Failed to load courses:', error);
      alert("Failed to load available courses. Please try again.");
    }
  };


  // ==============================
  // 开始考试
  // ==============================

  const handleConfirmStart = () => {

    if (!selectedCourse) {

      alert(
        'Please select a module first!'
      );

      return;

    }

    setIsModalOpen(false);

    navigate(
      `/exam?moduleId=${selectedCourse}`
    );

  };


  return (

    <div className={styles.page}>

      <div className={styles['header-zone']}>

        <TopNav />

      </div>


      <main className={styles.container}>

        <section className={styles['header-section']}>

          <h1 className={styles['main-title']}>

            Adaptive Assessment

          </h1>

          <p className={styles['header-description']}>

            Empowering your academic journey with AI driven
            adaptive tests. A dynamically adaptive test based
            on your skill level to efficiently reflect your
            weaknesses.

          </p>

        </section>


        {isLoading ? (

          <div
            style={{
              textAlign: 'center',
              padding: '50px',
              color: '#6b7280'
            }}
          >

            <h2>

              Loading your performance data... 🚀

            </h2>

          </div>

        ) : !hasHistory ? (

          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              border: '2px dashed #cbd5e1',
              margin: '20px 0'
            }}
          >

            <h2
              style={{
                color: '#1e293b',
                marginBottom: '16px'
              }}
            >

              Welcome to Your AI Testing Hub! 🚀

            </h2>

            <p
              style={{
                color: '#64748b',
                maxWidth: '600px',
                margin: '0 auto 30px'
              }}
            >

              It looks like you haven't taken any assessments yet.
              Start your first adaptive test to unlock your
              personalized Assessment Summary and Skill Mastery.

            </p>

            <button
              onClick={handleOpenTestModal}
              style={{
                padding: '12px 28px',
                backgroundColor: '#0b5edd',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >

              Start Your First Test Now

            </button>

          </div>

        ) : (

          <>

            <section className={styles['content-grid']}>

              <AdaptiveTestBar

                totalAttempts={
                  dashboardData.totalAttempts
                }

                highestScore={
                  dashboardData.highestScore
                }

                onStartClick={
                  handleOpenTestModal
                }

              />


              <AssessmentSummary

                latestScore={
                  dashboardData.latestScore
                }

                averageScore={
                  dashboardData.averageScore
                }

                accuracyRate={
                  dashboardData.accuracyRate
                }

                averageTime={
                  dashboardData.averageTime
                }

              />

            </section>


            <SkillMastery

              skills={
                dashboardData.skills || []
              }

            />

          </>

        )}

      </main>


      <div className={styles['footer-zone']}>

        <Footer />

      </div>


      {isModalOpen && (

        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor:
              'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >

          <div
            style={{
              background: '#ffffff',
              padding: '32px',
              borderRadius: '16px',
              width: '450px',
              maxWidth: '90%',
              boxShadow:
                '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}
          >

            <h2
              style={{
                margin: '0 0 16px 0',
                color: '#0f172a'
              }}
            >

              Select Assessment Module

            </h2>


            <p
              style={{
                color: '#64748b',
                margin: '0 0 24px 0',
                fontSize: '14px'
              }}
            >

              Choose the course module you want to be tested on.

            </p>


            {isLoadingCourses ? (

              <div
                style={{
                  padding: '20px 0',
                  textAlign: 'center',
                  color: '#0b5edd'
                }}
              >

                Fetching available modules... ⏳

              </div>

            ) : (

              <select

                value={selectedCourse}

                onChange={(event) =>
                  setSelectedCourse(
                    event.target.value
                  )
                }

                style={{
                  width: '100%',
                  padding: '12px 32px 12px 16px',
                  marginBottom: '32px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}

              >

                {courses.map((course) => (

                  <option
                    key={course.id}
                    value={course.id}
                  >

                    {course.name}

                  </option>

                ))}

              </select>

            )}


            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px'
              }}
            >

              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'transparent', cursor: 'pointer', fontWeight: '600', color: '#475569' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmStart} 
                disabled={isLoadingCourses || !selectedCourse}
                style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0b5edd', color: '#fff', cursor: 'pointer', fontWeight: '600', opacity: (isLoadingCourses || !selectedCourse) ? 0.6 : 1 }}
              >
                Confirm & Start
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default aiTestDashboard;