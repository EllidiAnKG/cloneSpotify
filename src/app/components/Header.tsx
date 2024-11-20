import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <h1>Spotify Clone</h1>
      <input type="text" placeholder="Search" className={styles.searchBar} />
    </header>
  );
};

export default Header;