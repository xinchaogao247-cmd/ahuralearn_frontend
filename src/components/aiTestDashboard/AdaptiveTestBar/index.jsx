import styles from './adaptiveTestBar.module.css';


const AdaptiveTestBar = ({

  totalAttempts = 0,

  highestScore = 0,

  onStartClick

}) => {

  return (

    <div className={styles['test-ready']}>

      <div className={styles['test-icon']}>

        🎯

      </div>


      <h3>

        Ready to test your knowledge?

      </h3>


      <p>

        You have completed

        <strong> {totalAttempts} </strong>

        adaptive assessments.

        Your highest score is

        <strong> {highestScore}%</strong>.

      </p>


      <button

        className={styles['btn-test']}

        onClick={onStartClick}

      >

        Start Adaptive Test

      </button>


      <p className={styles['estimate-text']}>

        Estimated time: 5-10 minutes

      </p>

    </div>

  );

};

export default AdaptiveTestBar;