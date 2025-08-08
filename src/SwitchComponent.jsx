import React, { useState } from 'react';
import MainComponent from './Maincomponent.jsx';       // Online version
import OfflineComponent from './offlinecomponent.jsx'; // Offline version

const SwitchComponent = () => {
  const [isOnline, setIsOnline] = useState(true);

  const handleToggle = () => {
    setIsOnline(prev => !prev);
  };

  return (
    <div>
      <button onClick={handleToggle}>
        Switch to {isOnline ? 'Offline' : 'Online'} Mode
      </button>

      {isOnline ? <MainComponent /> : <OfflineComponent/>}
    </div>
  );
};

export default SwitchComponent;
