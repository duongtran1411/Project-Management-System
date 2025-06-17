import React from "react";
import styles from "../../css/header.module.css";

const Header: React.FC = () => {
  return (
    <div className={styles.container}>
      <img src="/jira_icon.png" alt="Logo" className={styles.logo} />
      <h1 className={styles.nameProject}>Hub</h1>
    </div>
  );
};

export default Header;
