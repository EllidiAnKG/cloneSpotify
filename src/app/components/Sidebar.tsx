
import styles from './Sidebar.module.css';

const Sidebar = () => {
  return (
    <nav className={styles.sidebar}>
      <ul>
        <li>Home</li>
        <li>Search</li>
        <li>Your Library</li>
      </ul>
    </nav>
  );
};

export default Sidebar;
