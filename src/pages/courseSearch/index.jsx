import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchCourses } from '../../api/course/course';
import TopNav from '../../components/common/TopNav';
import FilterMenu from '../../components/courseSearch/FilterMenu';
import CourseCard from '../../components/courseSearch/CourseCard';
import Pagination from '../../components/courseSearch/Pagination';
import Footer from '../../components/common/Footer';
import styles from './courseSearch.module.css';

export default function CourseSearch() {

  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  // 核心状态管理
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
      try {
        
        const response = await searchCourses({ ...filters, keyword });
        
        // // 假设后端返回的数据在 data.data 或者 response直接是标准格式
        // // 根据你提供的接口定义，返回结构是 { status, data: { pagination, courses } }
        // const { list: fetchedCourses, pagination } = response;
        
        // setCourses(fetchedCourses || []);
        // if (pagination) {
        //   setPaginationMeta(pagination);
        // }

        // 提取数据部分：
        // 1. 如果是真实的 axios 响应，数据在 response.data
        // 2. 如果后端格式包了一层 { code: 200, data: ... }
        // 3. 兼容本地 mock 直接 resolve({ data: ... })
        const actualData = response;

        // 兼容真实后端的 { list, pages, total } 以及 本地 Mock 的 { courses, pagination }
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
        console.error('Failed to fetch search courses:', error);
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

  return (
    <div className={styles.pageContainer}>
      <TopNav />
      <main className={styles.mainContent}>
        <div className={styles.headerSection}>
          <FilterMenu filters={filters} onFilterChange={handleFilterChange} />
        </div>

        <div className={styles.gridSection}>
          {isLoading ? (
            // 加载中的骨架屏占位
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className={styles.skeletonCard}></div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            // 正常渲染课程网格
            <div className={styles.courseGrid}>
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            // 搜索不到内容时的空状态
            <div className={styles.emptyState}>
              <p>No courses found matching your criteria.</p>
              <button 
                className={styles.clearBtn}
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* 底部跨页组件 */}
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
