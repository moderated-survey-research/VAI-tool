import React from "react";
import styles from "./styles.module.css";

const TripleDots: React.FC = () => {
  return (
    <div className={styles.progress}>
      <div className={`bg-content3-foreground ${styles.progressDot}`}></div>
      <div className={`bg-content3-foreground ${styles.progressDot} ${styles.progressDotTwo}`}></div>
      <div className={`bg-content3-foreground ${styles.progressDot} ${styles.progressDotThree}`}></div>
    </div>
  );
};

export default TripleDots;
