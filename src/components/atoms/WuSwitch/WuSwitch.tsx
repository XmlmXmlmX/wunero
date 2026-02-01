import React from 'react';
import styles from './WuSwitch.module.css';

export interface WuSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  id?: string;
}

const WuSwitch: React.FC<WuSwitchProps> = ({ 
  checked, 
  onChange, 
  label, 
  disabled = false,
  id 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className={styles.switchContainer}>
      <label className={styles.switch}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className={styles.input}
        />
        <span className={`${styles.slider} ${disabled ? styles.disabled : ''}`}></span>
      </label>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
    </div>
  );
};

export default WuSwitch;
