import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchCourses } from '../../api/course/course';
import TopNav from '../../components/common/TopNav';
import FilterMenu from '../../components/courseSearch/FilterMenu';
import CourseCard from '../../components/courseSearch/CourseCard';
import Pagination from '../../components/courseSearch/Pagination';
import Footer from '../../components/common/Footer';
import searchEmptyImg from '../../assets/images/emptyStates/search_empty.png';
import styles from './courseSearch.module.css';
import { showToast } from '../../components/common/toast';

export default function CourseSearch() {

  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';
  const [showErrorState, setShowErrorState] = useState(false);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paginationMeta, setPaginationMeta] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0
  });

  const filters = {
    pageNo: parseInt(searchParams.get('pageNo')) || 1,
    pageSize: parseInt(searchParams.get('pageSize')) || 12,
    difficulty: searchParams.get('difficulty') || '',
    minRating: searchParams.get('minRating') || '',
    sortBy: searchParams.get('sortBy') || 'relevance'
  };

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      setShowErrorState(false);
      
      try {
        const response = await searchCourses({ ...filters, keyword });
        const actualData = response;

        const fetchedCourses = actualData.list || [];
        const totalPages = actualData.pages || actualData.pagination?.totalPages || 1;
        const totalRecords = actualData.total || actualData.pagination?.totalRecords || 0;

        setCourses(fetchedCourses);
        setPaginationMeta({
          currentPage: filters.pageNo,
          totalPages: totalPages,
          totalRecords: totalRecords
        });

      } catch (error) {
        showToast(error.message || 'Failed to search for any courses.', "error");
        setShowErrorState(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);

    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }

    if (key !== 'pageNo') {
      newParams.set('pageNo', '1');
    }

    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > paginationMeta.totalPages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('pageNo', newPage.toString());
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    const newParams = new URLSearchParams();
    if (keyword) {
      newParams.set('keyword', keyword);
    }
    setSearchParams(newParams);
  };

  // empty state
  if (showErrorState || !courses || courses.length === 0) {
    return (
      <div>
        <TopNav />
        <div className={styles.emptyStateContainer}>
          <img src={searchEmptyImg} alt="No courses found" className={styles.emptyStateImage} />
          <p className={styles.emptyStateText}>Oops! No courses found matching your criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <TopNav />
      <main className={styles.mainContent}>
        <div className={styles.headerSection}>
          <FilterMenu filters={filters} onFilterChange={handleFilterChange} />
        </div>

        <div className={styles.gridSection}>
          {isLoading ? (
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className={styles.skeletonCard}></div>
              ))}
            </div>
          ) : ( // render course data normally
            <div className={styles.courseGrid}>
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>

        {!isLoading && courses.length > 0 && paginationMeta.totalPages > 1 && (
          <div className={styles.paginationSection}>
            <Pagination
              currentPage={paginationMeta.currentPage}
              totalPages={paginationMeta.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
